import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class ContactMailError extends Error {
  stage: "business" | "acknowledgement";
  businessMessageId?: string;

  constructor(
    stage: "business" | "acknowledgement",
    message: string,
    businessMessageId?: string,
  ) {
    super(message);
    this.name = "ContactMailError";
    this.stage = stage;
    this.businessMessageId = businessMessageId;
  }
}

let transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;

export function getContactRecipientEmail() {
  return process.env.CONTACT_RECIPIENT_EMAIL || "info@ketronics.co.ke";
}

export function getMailFromAddress() {
  return (
    process.env.SMTP_FROM ||
    process.env.MAIL_FROM ||
    process.env.SMTP_USER ||
    "Ketronics LTD <info@ketronics.co.ke>"
  );
}

export function isMailConfigured() {
  return Boolean(process.env.SMTP_URL || process.env.SMTP_HOST);
}

function getTransporter() {
  if (!isMailConfigured()) {
    throw new ContactMailError(
      "business",
      "SMTP is not configured. Set SMTP_HOST or SMTP_URL before sending contact email.",
    );
  }

  if (!transporter) {
    if (process.env.SMTP_URL) {
      transporter = nodemailer.createTransport(process.env.SMTP_URL);
    } else {
      const port = Number(process.env.SMTP_PORT || 587);
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
      const options: SMTPTransport.Options = {
        host: process.env.SMTP_HOST,
        port: Number.isFinite(port) ? port : 587,
        secure:
          process.env.SMTP_SECURE === "true" ||
          process.env.SMTP_SECURE === "1" ||
          port === 465,
      };

      if (user && pass) {
        options.auth = { user, pass };
      }

      transporter = nodemailer.createTransport(options);
    }
  }

  return transporter;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

function cleanHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  }).format(date);
}

function businessEmailHtml(contactMessage: ContactMessage, sentAt: Date) {
  const messageHtml = escapeHtml(contactMessage.message).replace(/\n/g, "<br />");

  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">New contact message</h2>
      <p style="margin: 0 0 12px;">A visitor submitted the Ketronics LTD contact form.</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
        <tr><td style="padding: 6px 0; font-weight: bold;">Name</td><td style="padding: 6px 0;">${escapeHtml(contactMessage.name)}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Email</td><td style="padding: 6px 0;">${escapeHtml(contactMessage.email)}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Subject</td><td style="padding: 6px 0;">${escapeHtml(contactMessage.subject)}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Sent</td><td style="padding: 6px 0;">${escapeHtml(formatDate(sentAt))}</td></tr>
      </table>
      <div style="margin-top: 20px; padding: 16px; border-left: 4px solid #2563eb; background: #f8fafc;">
        ${messageHtml}
      </div>
    </div>
  `;
}

function businessEmailText(contactMessage: ContactMessage, sentAt: Date) {
  return [
    "New contact message from ketronics.co.ke",
    "",
    `Name: ${contactMessage.name}`,
    `Email: ${contactMessage.email}`,
    `Subject: ${contactMessage.subject}`,
    `Sent: ${formatDate(sentAt)}`,
    "",
    "Message:",
    contactMessage.message,
  ].join("\n");
}

function acknowledgementHtml(contactMessage: ContactMessage) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">We received your message</h2>
      <p>Hi ${escapeHtml(contactMessage.name)},</p>
      <p>Thank you for contacting Ketronics LTD. We have received your message about <strong>${escapeHtml(contactMessage.subject)}</strong>.</p>
      <p>Our team will review it and reply as soon as possible.</p>
      <p style="margin-top: 24px;">Regards,<br />Ketronics LTD</p>
    </div>
  `;
}

function acknowledgementText(contactMessage: ContactMessage) {
  return [
    `Hi ${contactMessage.name},`,
    "",
    `Thank you for contacting Ketronics LTD. We have received your message about "${contactMessage.subject}".`,
    "Our team will review it and reply as soon as possible.",
    "",
    "Regards,",
    "Ketronics LTD",
  ].join("\n");
}

export async function sendContactEmails(contactMessage: ContactMessage) {
  const mailer = getTransporter();
  const sentAt = new Date();
  const from = getMailFromAddress();
  const businessSubject = `New contact message: ${cleanHeader(contactMessage.subject)}`;

  let businessMessageId: string | undefined;

  try {
    const businessResult = await mailer.sendMail({
      from,
      to: getContactRecipientEmail(),
      replyTo: {
        name: cleanHeader(contactMessage.name),
        address: contactMessage.email,
      },
      subject: businessSubject,
      text: businessEmailText(contactMessage, sentAt),
      html: businessEmailHtml(contactMessage, sentAt),
    });

    businessMessageId = businessResult.messageId;
  } catch (error) {
    console.error("Failed to send contact message to Ketronics:", error);
    throw new ContactMailError(
      "business",
      "The contact message could not be sent to Ketronics.",
    );
  }

  try {
    const acknowledgementResult = await mailer.sendMail({
      from,
      to: {
        name: cleanHeader(contactMessage.name),
        address: contactMessage.email,
      },
      replyTo: getContactRecipientEmail(),
      subject: "We received your message - Ketronics LTD",
      text: acknowledgementText(contactMessage),
      html: acknowledgementHtml(contactMessage),
    });

    return {
      businessMessageId,
      acknowledgementMessageId: acknowledgementResult.messageId,
    };
  } catch (error) {
    console.error("Failed to send contact acknowledgement:", error);
    throw new ContactMailError(
      "acknowledgement",
      "The contact message reached Ketronics, but the acknowledgement email could not be sent.",
      businessMessageId,
    );
  }
}


export interface OrderNotification {
  orderId: string;
  total: number;
  status: string;
  customerName?: string;
  customerEmail?: string | null;
  customerPhone?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

export async function sendOrderNotification(order: OrderNotification) {
  if (!isMailConfigured()) return { sent: false, reason: "smtp_not_configured" };

  const mailer = getTransporter();
  const from = getMailFromAddress();
  const subject = `Ketronics order ${cleanHeader(order.orderId.slice(-8).toUpperCase())} - ${cleanHeader(order.status)}`;
  const itemLines = (order.items || []).map((item) => `${item.name} x${item.quantity} - Ksh. ${item.price.toFixed(2)}`);
  const text = [
    `Order: ${order.orderId}`,
    `Status: ${order.status}`,
    `Customer: ${order.customerName || "Customer"}`,
    order.customerPhone ? `Phone: ${order.customerPhone}` : "",
    order.trackingNumber ? `Tracking: ${order.trackingNumber}` : "",
    order.carrier ? `Carrier: ${order.carrier}` : "",
    order.estimatedDelivery ? `Estimated delivery: ${order.estimatedDelivery}` : "",
    "",
    "Items:",
    ...itemLines,
    "",
    `Total: Ksh. ${order.total.toFixed(2)}`,
  ].filter(Boolean).join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2>Ketronics LTD — Order Update</h2>
      <p><strong>Order:</strong> ${escapeHtml(order.orderId)}</p>
      <p><strong>Status:</strong> ${escapeHtml(order.status)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(order.customerName || "Customer")}</p>
      ${order.customerPhone ? `<p><strong>Phone:</strong> ${escapeHtml(order.customerPhone)}</p>` : ""}
      ${order.trackingNumber ? `<p><strong>Tracking:</strong> ${escapeHtml(order.trackingNumber)}</p>` : ""}
      ${order.carrier ? `<p><strong>Carrier:</strong> ${escapeHtml(order.carrier)}</p>` : ""}
      ${order.estimatedDelivery ? `<p><strong>Estimated delivery:</strong> ${escapeHtml(order.estimatedDelivery)}</p>` : ""}
      <h3>Items</h3>
      <ul>${itemLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
      <p><strong>Total:</strong> Ksh. ${order.total.toFixed(2)}</p>
    </div>
  `;

  const recipients = [getContactRecipientEmail()];
  if (order.customerEmail && order.customerEmail !== getContactRecipientEmail()) recipients.push(order.customerEmail);

  await Promise.all(recipients.map((to) => mailer.sendMail({
    from,
    to,
    subject,
    text,
    html,
  })));

  return { sent: true };
}
