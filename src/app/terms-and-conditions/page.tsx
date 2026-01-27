import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions - Ketronics LTD",
  description: "Read our terms and conditions for using Ketronics LTD services and purchasing products.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Terms and Conditions</h1>
        <p className="text-lg text-muted-foreground mt-4">
          Please read these terms and conditions carefully before using our services.
        </p>
      </div>

      <div className="prose prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Ketronics LTD's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Product Purchases</h2>
          <p>
            All sales are final unless the product is defective or damaged during shipping. We offer comprehensive warranties on all our products as specified by the manufacturer. Products must be returned in their original packaging with all accessories and documentation.
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>30-day return policy for unused products in original packaging</li>
            <li>All warranties are handled directly with the manufacturer</li>
            <li>Custom orders and installations are non-refundable</li>
            <li>Refunds are processed within 5-7 business days after approval</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Service Agreements</h2>
          <p>
            Service appointments must be scheduled in advance through our booking system. Our certified technicians provide installation, maintenance, and repair services for all major brands.
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>24-48 hour response time for service requests</li>
            <li>All work comes with a 90-day workmanship guarantee</li>
            <li>Cancellation fees apply for appointments cancelled less than 24 hours in advance</li>
            <li>Emergency services available for existing clients</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
          <p>
            We accept various payment methods including credit cards, debit cards, mobile money, and bank transfers. All payments must be cleared before products are released or services are performed.
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Full payment required for custom installations</li>
            <li>50% deposit required for orders over Ksh. 50,000</li>
            <li>Late payment fees of 2% per month apply to overdue accounts</li>
            <li>All prices are subject to change without notice</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Shipping and Delivery</h2>
          <p>
            We provide reliable shipping services throughout Kenya with various delivery options. Delivery times may vary based on location and product availability.
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Free shipping on orders over Ksh. 5,000</li>
            <li>Standard delivery: 2-5 business days</li>
            <li>Express delivery: 1-2 business days (additional fees apply)</li>
            <li>Same-day delivery available in select Nairobi areas</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p>
            Ketronics LTD shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our products or services. Our total liability shall not exceed the amount paid for the product or service in question.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
          <p>
            All content, trademarks, and materials on our website are owned by Ketronics LTD or our licensors and are protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written permission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Privacy</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our services, to understand our practices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of Kenya. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the Kenyan courts.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms and conditions at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services constitutes acceptance of the modified terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us:
          </p>
          <ul className="list-none mt-2">
            <li>Email: legal@ketronics.co.ke</li>
            <li>Phone: +254 700 000 000</li>
            <li>Address: Nairobi, Kenya</li>
          </ul>
        </section>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Last updated:</strong> January 27, 2026
          </p>
        </div>
      </div>
    </div>
  );
}