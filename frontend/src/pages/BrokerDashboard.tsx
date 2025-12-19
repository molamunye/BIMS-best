import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client"; // REMOVED
import { Menu, RefreshCw } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import BrokerSidebar from "@/components/dashboard/BrokerSidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import ListingsManager from "@/components/dashboard/ListingsManager";
import ProfileManager from "@/components/dashboard/ProfileManager";
import MessagesPanel from "@/components/dashboard/MessagesPanel";
import CommissionsPanel from "@/components/dashboard/CommissionsPanel";
import MyListings from "@/components/dashboard/MyListings";
import AddListing from "@/components/dashboard/AddListing";
import ListingVerification from "@/components/dashboard/ListingVerification";
import BrokerVerificationTasks from "@/components/dashboard/BrokerVerificationTasks";
import ApprovedListings from "@/components/dashboard/ApprovedListings";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import VerificationTaskNote from "@/components/dashboard/VerificationTaskNote";

export default function BrokerDashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("listings");
  const [userName, setUserName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>(""); // Needs backend support
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      // Use data from Auth Context
      setUserName(user.fullName || "");
      // Role verification is handled in AuthProvider redirect, but double check here if needed
      if (user.role === 'admin') navigate("/admin-dashboard");
      else if (user.role !== 'broker') navigate("/client-dashboard");
    }
  }, [user, navigate]);


  const handleRefresh = async () => {
    setRefreshing(true);
    // await loadUserProfile(); // Reload from API if needed
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "listings":
        return <DashboardOverview userRole="broker" onNavigate={setActiveTab} />;
      case "browse":
        return <ListingsManager userRole="broker" showAll={true} />;
      case "messages":
        return <MessagesPanel />;
      case "profile":
        return <ProfileManager onAvatarChange={handleAvatarChange} />;
      case "commissions":
        return <CommissionsPanel />;
      case "my-listings":
        return <MyListings />;
      case "add-listing":
        return <AddListing />;
      case "listing-verification":
        return <ListingVerification />;
      case "tasks":
        return <BrokerVerificationTasks />;
      case "approved-listings":
        return <ApprovedListings />;
      case "analytics":
        return <AnalyticsPanel />;
      case "verification-note":
        return <VerificationTaskNote />;
      default:
        return <DashboardOverview userRole="broker" onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block md:w-64 flex-shrink-0">
        <BrokerSidebar
          userRole="broker"
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSignOut={signOut}
          userName={userName}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full min-h-0">
        {/* Top Header */}
        <header className="bg-primary border-b border-primary/20 shadow-sm">
          <div className="px-4 md:px-8 py-4 flex items-center justify-between">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6 text-primary-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <BrokerSidebar
                  userRole="broker"
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onSignOut={signOut}
                  userName={userName}
                />
              </SheetContent>
            </Sheet>

            {/* Title */}
            <div className="flex-1 md:flex-initial">
              <h1 className="text-lg md:text-xl font-bold text-primary-foreground">Broker Dashboard</h1>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <ThemeToggle />
              <NotificationBell />
              <Avatar className="h-8 w-8">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
                <AvatarFallback className="bg-primary-foreground text-primary">
                  {userName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>

      {/* Right Sidebar - Verification Notes (hidden on small screens) */}
      
    </div>
  );
}
