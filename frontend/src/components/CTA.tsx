import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const CTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) navigate('/dashboard');
    else navigate('/auth');
  };

  return (
    <section className="relative py-24">
      {/* Background image (public) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.jpg')" }}
        aria-hidden
      />
      {/* Lighter overlay so background image shows through */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" aria-hidden />

      <div className="relative container mx-auto px-4 text-center z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-6">
          Ready to Find Your Perfect Match?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of satisfied clients who found their dream property or vehicle through BIMS.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-white hover:bg-white/90 text-primary text-lg px-8 py-6 shadow-elegant"
            onClick={handleGetStarted}
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
