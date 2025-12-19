import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Listings from "@/components/Listings";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Listings />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
