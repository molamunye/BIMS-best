import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground">
                  BIMS ("we," "our," or "us") is committed to protecting your privacy. This Privacy 
                  Policy explains how we collect, use, disclose, and safeguard your information when 
                  you use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                <div className="text-muted-foreground space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">2.1. Personal Information</h3>
                    <p>We collect information you provide directly to us, including:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Name, email address, and phone number</li>
                      <li>Account credentials (password, stored securely)</li>
                      <li>Profile information and preferences</li>
                      <li>Payment information (processed through secure third-party providers)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">2.2. Listing Information</h3>
                    <p>When you create a listing, we collect:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Property or vehicle details</li>
                      <li>Photos and documents you upload</li>
                      <li>Location and pricing information</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">2.3. Usage Information</h3>
                    <p>We automatically collect information about how you use our platform:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Device information and IP address</li>
                      <li>Browser type and version</li>
                      <li>Pages visited and actions taken</li>
                      <li>Date and time of access</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                <div className="text-muted-foreground space-y-3">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Verify listings and broker credentials</li>
                    <li>Send notifications about your account and listings</li>
                    <li>Respond to your inquiries and provide customer support</li>
                    <li>Detect, prevent, and address technical issues and fraud</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
                  <div>
                    <h3 className="font-semibold mb-2">4.1. With Other Users</h3>
                    <p>When you create a listing or contact an owner, relevant information (name, contact details) 
                    may be shared with other users as necessary for the transaction.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">4.2. With Service Providers</h3>
                    <p>We share information with third-party service providers who perform services on our behalf, 
                    such as payment processing, cloud storage, and analytics.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">4.3. Legal Requirements</h3>
                    <p>We may disclose information if required by law or in response to valid legal requests.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">4.4. Business Transfers</h3>
                    <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                    as part of that transaction.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your information 
                  against unauthorized access, alteration, disclosure, or destruction. However, no method of 
                  transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your information for as long as necessary to provide our services and comply 
                  with legal obligations. When you delete your account, we will delete or anonymize your 
                  personal information, except where we are required to retain it for legal purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
                <div className="text-muted-foreground space-y-3">
                  <p>You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access and receive a copy of your personal information</li>
                    <li>Correct inaccurate or incomplete information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Object to processing of your information</li>
                    <li>Withdraw consent where processing is based on consent</li>
                    <li>Export your data in a portable format</li>
                  </ul>
                  <p>To exercise these rights, please contact us using the information provided below.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground">
                  We use cookies and similar tracking technologies to track activity on our platform and 
                  store certain information. You can instruct your browser to refuse all cookies or to 
                  indicate when a cookie is being sent. However, if you do not accept cookies, you may 
                  not be able to use some portions of our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Third-Party Links</h2>
                <p className="text-muted-foreground">
                  Our platform may contain links to third-party websites. We are not responsible for 
                  the privacy practices of these external sites. We encourage you to review the privacy 
                  policies of any third-party sites you visit.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our platform is not intended for users under the age of 18. We do not knowingly collect 
                  personal information from children. If you believe we have collected information from a 
                  child, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                  You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
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

