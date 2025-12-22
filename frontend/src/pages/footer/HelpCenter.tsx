import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      title: "Getting Started",
      items: [
        {
          question: "How do I create an account?",
          answer: "Click on 'Sign Up' in the top navigation, fill in your details (name, email, password), and choose your role (Client, Broker, or Admin). Verify your email if required, and you're ready to start using BIMS."
        },
        {
          question: "What are the different user roles?",
          answer: "Clients can create listings and browse properties/vehicles. Brokers verify listings and earn commissions. Admins manage the platform, assign listings to brokers, and oversee operations."
        },
        {
          question: "How much does it cost to use BIMS?",
          answer: "Creating a listing costs 100 ETB. Contacting a listing owner costs 50 ETB. Brokers earn a 1% commission on successful sales. There are no monthly subscription fees."
        }
      ]
    },
    {
      title: "Creating Listings",
      items: [
        {
          question: "How do I create a listing?",
          answer: "After logging in, go to 'Add Listing' in your dashboard. Fill in the property/vehicle details, upload photos, add required documents, and pay the 100 ETB listing fee. Your listing will be reviewed by a verified broker."
        },
        {
          question: "What documents do I need?",
          answer: "For properties: ownership documents, location proof, and any relevant permits. For vehicles: registration documents, ownership proof, and inspection certificates. Upload these as PDF files."
        },
        {
          question: "How long does verification take?",
          answer: "Verification typically takes 1-3 business days after payment is confirmed. You'll receive a notification once your listing is approved or if additional information is needed."
        }
      ]
    },
    {
      title: "Payments & Fees",
      items: [
        {
          question: "What payment methods are accepted?",
          answer: "We accept payments through Chapa, which supports Telebirr, CBE Birr, M-Pesa, and other mobile money services. All payments are processed securely."
        },
        {
          question: "When do I pay the listing fee?",
          answer: "You pay the 100 ETB listing fee when creating your listing, before it goes live. Payment must be completed for your listing to be reviewed by a broker."
        },
        {
          question: "What is the commission structure?",
          answer: "When a listing is sold, the seller pays a 1% commission to the broker who verified the listing. This is only charged upon successful sale completion."
        }
      ]
    },
    {
      title: "Broker Services",
      items: [
        {
          question: "How do I become a verified broker?",
          answer: "Apply for broker status through your account settings. Submit required credentials and documents. Our admin team will review your application and verify your professional status."
        },
        {
          question: "How are listings assigned to brokers?",
          answer: "Admins assign listings to verified brokers based on expertise, availability, and location. You'll receive notifications when listings are assigned to you."
        },
        {
          question: "How do I track my commissions?",
          answer: "Log into your broker dashboard and navigate to the 'Commissions' section. You can see all pending and completed commissions, along with payment status."
        }
      ]
    },
    {
      title: "Troubleshooting",
      items: [
        {
          question: "I can't upload images. What should I do?",
          answer: "Ensure images are in JPG, PNG, or WebP format and under 5MB each. Check your internet connection. If issues persist, try clearing your browser cache or using a different browser."
        },
        {
          question: "My payment failed. What now?",
          answer: "Check your payment method has sufficient funds. Ensure you're using a supported payment method. If the issue continues, contact support with your transaction reference number."
        },
        {
          question: "I didn't receive a notification. Why?",
          answer: "Check your notification settings in your account. Ensure email notifications are enabled. Check your spam folder. Notifications also appear in your dashboard notification bell."
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find answers to common questions and learn how to use BIMS
            </p>

            <div className="relative mb-12">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-8">
              {filteredCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="border rounded-lg p-6 bg-card">
                  <h2 className="text-2xl font-semibold mb-4">{category.title}</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, itemIndex) => (
                      <AccordionItem key={itemIndex} value={`item-${categoryIndex}-${itemIndex}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No results found for "{searchQuery}"
                </p>
                <Button asChild variant="outline">
                  <Link to="/contact-us">Contact Support</Link>
                </Button>
              </div>
            )}

            <div className="mt-12 bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Still Need Help?</h2>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Our support team is ready to assist you.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link to="/contact-us">Contact Support</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/support">View Support Options</Link>
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

