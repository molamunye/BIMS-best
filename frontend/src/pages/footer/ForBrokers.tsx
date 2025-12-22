import { CheckCircle, DollarSign, Shield, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function ForBrokers() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">For Brokers</h1>
            <p className="text-xl text-muted-foreground mb-12">
              Join BIMS and grow your brokerage business with our comprehensive platform
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="p-6 rounded-lg border bg-card">
                <DollarSign className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-3">Earn Commissions</h2>
                <p className="text-muted-foreground mb-4">
                  Get paid for successful transactions. Our transparent commission system 
                  ensures you're rewarded for your hard work.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>1% commission on successful sales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Transparent payment tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Regular commission payouts</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <Users className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-3">Verified Status</h2>
                <p className="text-muted-foreground mb-4">
                  Build trust with clients through our verification process. Verified 
                  brokers get priority in listing assignments.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Professional verification badge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Priority listing assignments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Enhanced profile visibility</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-semibold mb-6">How It Works for Brokers</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Apply for Broker Status</h3>
                    <p className="text-muted-foreground">
                      Submit your application with required documents and credentials. 
                      Our admin team will review and verify your application.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Get Assigned Listings</h3>
                    <p className="text-muted-foreground">
                      Once verified, admins will assign listings to you for verification. 
                      You'll receive notifications for new assignments.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Verify and Approve</h3>
                    <p className="text-muted-foreground">
                      Review listing details, documents, and verify authenticity. 
                      Approve or reject listings based on your professional assessment.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Earn Commissions</h3>
                    <p className="text-muted-foreground">
                      When a listing you verified is sold, you earn a commission. 
                      Track your earnings in your broker dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 p-8 rounded-lg mb-12">
              <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-6">
                Join our network of verified brokers and start earning commissions today.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link to="/auth">Sign Up as Broker</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact-us">Contact Us</Link>
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

