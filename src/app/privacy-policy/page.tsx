import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Ketronics LTD",
  description: "Learn about how we protect and handle your personal information and data privacy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground mt-4">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
        </p>
      </div>

      <div className="prose prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, information we obtain automatically when you use our services, and information from third-party sources.
          </p>

          <h3 className="text-xl font-semibold mb-2">Personal Information You Provide:</h3>
          <ul className="list-disc pl-6">
            <li>Name, email address, and contact information</li>
            <li>Billing and shipping addresses</li>
            <li>Payment information (processed securely by third-party providers)</li>
            <li>Account credentials and preferences</li>
            <li>Communications you send to us</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">Information Collected Automatically:</h3>
          <ul className="list-disc pl-6">
            <li>Device information and browser type</li>
            <li>IP address and location data</li>
            <li>Usage patterns and website interactions</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
          </p>
          <ul className="list-disc pl-6">
            <li>Process and fulfill your orders</li>
            <li>Provide customer support and technical assistance</li>
            <li>Send you important updates and notifications</li>
            <li>Personalize your experience and recommendations</li>
            <li>Prevent fraud and ensure security</li>
            <li>Comply with legal obligations</li>
            <li>Analyze usage patterns to improve our services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul className="list-disc pl-6">
            <li>With service providers who help us operate our business</li>
            <li>To comply with legal obligations or court orders</li>
            <li>To protect our rights, property, or safety</li>
            <li>With your explicit consent</li>
            <li>In connection with a business transfer or acquisition</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
          <ul className="list-disc pl-6">
            <li>SSL/TLS encryption for data transmission</li>
            <li>Secure payment processing through certified providers</li>
            <li>Regular security audits and updates</li>
            <li>Employee training on data protection</li>
            <li>Access controls and authentication requirements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content.
          </p>

          <h3 className="text-xl font-semibold mb-2">Types of Cookies We Use:</h3>
          <ul className="list-disc pl-6">
            <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
            <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
          </ul>

          <p className="mt-4">
            You can control cookie settings through your browser preferences. However, disabling certain cookies may affect website functionality.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
          <p>
            You have certain rights regarding your personal information under applicable data protection laws.
          </p>
          <ul className="list-disc pl-6">
            <li><strong>Access:</strong> Request a copy of your personal information</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Receive your data in a structured format</li>
            <li><strong>Objection:</strong> Object to certain processing activities</li>
            <li><strong>Restriction:</strong> Limit how we process your information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.
          </p>
          <ul className="list-disc pl-6">
            <li>Account information: Retained while your account is active</li>
            <li>Order history: Retained for 7 years for tax and legal purposes</li>
            <li>Marketing preferences: Retained until you unsubscribe</li>
            <li>Analytics data: Anonymized after 2 years</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than Kenya. We ensure appropriate safeguards are in place to protect your data during such transfers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
          <p>
            Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will delete it immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul className="list-none mt-2">
            <li><strong>Email:</strong> privacy@ketronics.co.ke</li>
            <li><strong>Phone:</strong> +254 700 000 000</li>
            <li><strong>Address:</strong> AA building floor room F6A</li>
            <li><strong>Data Protection Officer:</strong> dpo@ketronics.co.ke</li>
          </ul>
        </section>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Last updated:</strong> January 27, 2026
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This privacy policy complies with the Kenyan Data Protection Act and international data protection standards.
          </p>
        </div>
      </div>
    </div>
  );
}