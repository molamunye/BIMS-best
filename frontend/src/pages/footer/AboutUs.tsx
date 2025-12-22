import { Building2, Users, Shield, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

export default function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">About BIMS</h1>
            
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl text-muted-foreground mb-8">
                BIMS (Broker Information Management System) is a comprehensive platform 
                designed to connect trusted brokers with clients for seamless property 
                and vehicle transactions in Ethiopia.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="p-6 rounded-lg border bg-card">
                <Building2 className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
                <p className="text-muted-foreground">
                  To revolutionize the real estate and vehicle brokerage industry in Ethiopia 
                  by providing a transparent, efficient, and trustworthy platform that connects 
                  buyers, sellers, and verified brokers.
                </p>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <Shield className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
                <p className="text-muted-foreground">
                  To become Ethiopia's leading digital marketplace for property and vehicle 
                  transactions, setting the standard for transparency, security, and customer 
                  satisfaction in the brokerage industry.
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-semibold mb-6">What We Offer</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Verified Brokers</h3>
                    <p className="text-muted-foreground">
                      All brokers on our platform undergo a rigorous verification process 
                      to ensure credibility and professionalism.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
                    <p className="text-muted-foreground">
                      We provide secure payment processing and transaction management 
                      to protect both buyers and sellers throughout the process.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Comprehensive Listings</h3>
                    <p className="text-muted-foreground">
                      Browse verified property and vehicle listings with detailed information, 
                      high-quality images, and transparent pricing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
              <p className="text-muted-foreground mb-4">
                BIMS is developed and maintained by a dedicated team of professionals 
                committed to improving the brokerage experience in Ethiopia.
              </p>
              <p className="text-muted-foreground">
                <strong>Developed by:</strong> Adey Assefa, Mola Munye, and Team
              </p>
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

