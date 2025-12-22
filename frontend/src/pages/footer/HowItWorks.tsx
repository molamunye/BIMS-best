import { Search, Shield, FileCheck, Handshake, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">How It Works</h1>
            <p className="text-xl text-muted-foreground mb-12">
              A simple, secure process for buying, selling, and verifying properties and vehicles
            </p>

            <div className="space-y-12 mb-12">
              <div>
                <h2 className="text-2xl font-semibold mb-6">For Buyers</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Search className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">1. Browse Listings</h3>
                      <p className="text-muted-foreground">
                        Explore verified property and vehicle listings with detailed information, 
                        photos, and transparent pricing. Filter by location, type, and price range.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Handshake className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">2. Contact Owner</h3>
                      <p className="text-muted-foreground">
                        Pay a small contact fee to get in touch with the listing owner. 
                        This ensures serious inquiries and protects seller privacy.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">3. Complete Transaction</h3>
                      <p className="text-muted-foreground">
                        Work directly with the owner to finalize the purchase. All listings 
                        are verified by professional brokers for authenticity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6">For Sellers</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileCheck className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">1. Create Listing</h3>
                      <p className="text-muted-foreground">
                        Sign up, create your listing with photos and details, and pay a 
                        small listing fee. Upload required documents for verification.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">2. Get Verified</h3>
                      <p className="text-muted-foreground">
                        A verified broker reviews your listing and documents. Once approved, 
                        your listing goes live and is visible to potential buyers.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">3. Receive Inquiries</h3>
                      <p className="text-muted-foreground">
                        Interested buyers pay a contact fee to reach you. Communicate directly 
                        and complete the sale. You pay a 1% commission to the verifying broker 
                        upon successful sale.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6">For Brokers</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileCheck className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">1. Get Verified</h3>
                      <p className="text-muted-foreground">
                        Apply for broker status with required credentials. Once verified, 
                        you can be assigned listings for verification.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">2. Verify Listings</h3>
                      <p className="text-muted-foreground">
                        Review assigned listings, check documents, and verify authenticity. 
                        Approve or reject based on your professional assessment.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">3. Earn Commissions</h3>
                      <p className="text-muted-foreground">
                        When a listing you verified is sold, you earn a 1% commission. 
                        Track your earnings in your broker dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Why Choose BIMS?</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>All listings verified by professional brokers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Secure payment processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Transparent pricing and fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Direct communication between buyers and sellers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Professional support throughout the process</span>
                </li>
              </ul>
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

