import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeListings: 0, verifiedBrokers: 0, happyClients: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  // metrics removed from hero — dashboard sidebar shows detailed metrics

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/public/stats');
        if (res.ok) {
          const data = await res.json();
          setStats({
            activeListings: data.activeListings || 0,
            verifiedBrokers: data.verifiedBrokers || 0,
            happyClients: data.happyClients || 0
          });
        }
      } catch (e) {
        console.error('Failed to load public stats', e);
      } finally {
        setLoadingStats(false);
      }
    };
    load();
  }, []);

  const handleViewDashboard = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background image (public folder) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.jpg')" }}
        aria-hidden
      />
      {/* Lighter overlay so background image shows through */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" aria-hidden />
      
      {/* Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg mb-6 animate-fade-in">
          Broker Information <br />
          <span className="text-white/95">Management System</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/85 mb-8 max-w-3xl mx-auto animate-fade-in-delayed">
          Smart connections for modern brokerage. Find properties and vehicles with trusted brokers in Hossana and beyond.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delayed-more">
          <Link to="/auth">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-6 bg-white hover:bg-white/90 text-primary shadow-elegant"
            >
              <Search className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-primary transition-all duration-300"
            onClick={handleViewDashboard}
          >
            View Dashboard
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">{loadingStats ? '...' : stats.activeListings}</div>
            <div className="text-white/80">Active Listings</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">{loadingStats ? '...' : stats.verifiedBrokers}</div>
            <div className="text-white/80">Verified Brokers</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">{loadingStats ? '...' : stats.happyClients}</div>
            <div className="text-white/80">Happy Clients</div>
          </div>
        </div>
        {/* Platform metrics removed from hero — metrics now shown in dashboard sidebars */}
      </div>
    </section>
  );
};

export default Hero;
