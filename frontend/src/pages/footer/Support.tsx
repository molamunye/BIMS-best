import { HelpCircle, Mail, MessageSquare, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function Support() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Support</h1>
            <p className="text-xl text-muted-foreground mb-12">
              We're here to help you with any questions or issues
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="p-6 rounded-lg border bg-card">
                <HelpCircle className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-3">Help Center</h2>
                <p className="text-muted-foreground mb-4">
                  Find answers to frequently asked questions and step-by-step guides 
                  for using BIMS.
                </p>
                <Button asChild variant="outline">
                  <Link to="/help-center">Visit Help Center</Link>
                </Button>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <Mail className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  Get in touch with our support team for personalized assistance 
                  with your account or transactions.
                </p>
                <Button asChild variant="outline">
                  <Link to="/contact-us">Contact Support</Link>
                </Button>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <MessageSquare className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-3">Live Chat</h2>
                <p className="text-muted-foreground mb-4">
                  Chat with our support team in real-time for immediate assistance 
                  (Available during business hours).
                </p>
                <Button asChild variant="outline" disabled>
                  <span>Coming Soon</span>
                </Button>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <BookOpen className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-3">Documentation</h2>
                <p className="text-muted-foreground mb-4">
                  Access comprehensive documentation and guides for using all 
                  features of the BIMS platform.
                </p>
                <Button asChild variant="outline">
                  <Link to="/help-center">View Documentation</Link>
                </Button>
              </div>
            </div>

            <div className="bg-muted p-8 rounded-lg mb-12">
              <h2 className="text-2xl font-semibold mb-4">Common Support Topics</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Account & Billing</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Creating and managing your account</li>
                    <li>• Payment and billing questions</li>
                    <li>• Subscription and fees</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Listings</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Creating and editing listings</li>
                    <li>• Listing verification process</li>
                    <li>• Managing your listings</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Transactions</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Payment processing</li>
                    <li>• Contact fees</li>
                    <li>• Commission payments</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Broker Services</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Becoming a verified broker</li>
                    <li>• Listing verification</li>
                    <li>• Commission tracking</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 p-8 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Need Immediate Help?</h2>
              <p className="text-muted-foreground mb-4">
                Our support team is available to assist you. Reach out through any of 
                the channels above, and we'll get back to you as soon as possible.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link to="/contact-us">Contact Support</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/help-center">Browse Help Center</Link>
                </Button>
              </div>
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

