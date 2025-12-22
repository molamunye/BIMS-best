import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using BIMS (Broker Information Management System), you accept 
                  and agree to be bound by these Terms of Service. If you do not agree to these 
                  terms, please do not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground">
                  BIMS is a platform that connects property and vehicle sellers with buyers through 
                  verified brokers. We facilitate transactions, provide verification services, and 
                  process payments for listing and contact fees.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                <div className="text-muted-foreground space-y-3">
                  <p>3.1. You must create an account to use certain features of BIMS.</p>
                  <p>3.2. You are responsible for maintaining the confidentiality of your account credentials.</p>
                  <p>3.3. You must provide accurate and complete information when creating your account.</p>
                  <p>3.4. You are responsible for all activities that occur under your account.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Listing and Content</h2>
                <div className="text-muted-foreground space-y-3">
                  <p>4.1. You may create listings for properties or vehicles you own or have authority to sell.</p>
                  <p>4.2. All listings must be accurate, complete, and not misleading.</p>
                  <p>4.3. You must provide required documents for verification.</p>
                  <p>4.4. BIMS reserves the right to reject, remove, or modify any listing that violates these terms.</p>
                  <p>4.5. You grant BIMS a license to display, modify, and distribute your listing content.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Fees and Payments</h2>
                <div className="text-muted-foreground space-y-3">
                  <p>5.1. Listing Fee: 100 ETB per listing (non-refundable after verification begins).</p>
                  <p>5.2. Contact Fee: 50 ETB to contact a listing owner (non-refundable).</p>
                  <p>5.3. Commission: 1% of sale price paid to verifying broker upon successful sale.</p>
                  <p>5.4. All fees are processed through secure payment gateways.</p>
                  <p>5.5. Refunds are at BIMS's discretion and subject to our refund policy.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Broker Verification</h2>
                <div className="text-muted-foreground space-y-3">
                  <p>6.1. Brokers must undergo verification before being assigned listings.</p>
                  <p>6.2. Brokers are responsible for accurate verification of listings.</p>
                  <p>6.3. BIMS reserves the right to revoke broker status for violations.</p>
                  <p>6.4. Brokers earn commissions only on successfully completed sales.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Prohibited Activities</h2>
                <div className="text-muted-foreground space-y-3">
                  <p>You agree not to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Post false, misleading, or fraudulent information</li>
                    <li>Impersonate any person or entity</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Interfere with or disrupt the platform's operation</li>
                    <li>Attempt to gain unauthorized access to the platform</li>
                    <li>Use automated systems to access the platform without permission</li>
                    <li>Harass, abuse, or harm other users</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  All content on BIMS, including logos, text, graphics, and software, is the property 
                  of BIMS or its licensors and is protected by copyright and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  BIMS acts as a platform connecting buyers, sellers, and brokers. We are not a party 
                  to transactions and are not responsible for the accuracy of listings, the conduct of 
                  users, or the outcome of transactions. Users transact at their own risk.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Dispute Resolution</h2>
                <p className="text-muted-foreground">
                  Disputes between users should be resolved directly. BIMS may assist in dispute 
                  resolution but is not obligated to do so. Any disputes with BIMS shall be resolved 
                  through arbitration in accordance with Ethiopian law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Modifications to Terms</h2>
                <p className="text-muted-foreground">
                  BIMS reserves the right to modify these terms at any time. Continued use of the 
                  platform after changes constitutes acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
                <p className="text-muted-foreground">
                  BIMS may terminate or suspend your account at any time for violations of these terms 
                  or for any other reason. You may terminate your account at any time through your 
                  account settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
                <p className="text-muted-foreground">
                  For questions about these Terms of Service, please contact us at:
                </p>
                <ul className="text-muted-foreground space-y-2 ml-4">
                  <li>Email: <a href="mailto:munyemola@gmail.com" className="text-primary hover:underline">munyemola@gmail.com</a></li>
                  <li>Phone: <a href="tel:+251924548557" className="text-primary hover:underline">+251 924 548 557</a></li>
                  <li>Website: <Link to="/contact-us" className="text-primary hover:underline">Contact Us</Link></li>
                </ul>
              </section>
            </div>

            <div className="mt-12 text-center">
              <Link 
                to="/" 
                className="text-primary hover:underline"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

