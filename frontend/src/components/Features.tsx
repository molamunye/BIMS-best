import { Shield, Search, MessageSquare, FileCheck, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Search,
    title: "Advanced Search",
    description: "Find exactly what you're looking for with powerful filters for location, price, type, and more."
  },
  {
    icon: Shield,
    title: "Verified Listings",
    description: "All brokers and listings are verified by our admin team for your safety and peace of mind."
  },
  {
    icon: MessageSquare,
    title: "Real-Time Chat",
    description: "Connect instantly with brokers through our integrated messaging system."
  },
  {
    icon: FileCheck,
    title: "Transparent Process",
    description: "Track every step of your transaction with full transparency and documentation."
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Get access to market trends and pricing data to make informed decisions."
  },
  {
    icon: Users,
    title: "Trusted Community",
    description: "Join a growing community of verified brokers and satisfied clients."
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose BIMS?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Modern tools and features designed to make your brokerage experience seamless and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-border hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-card"
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-elegant">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
