import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client"; // Removed
import { Bell, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import BrokerSidebar from "@/components/dashboard/BrokerSidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import ListingsManager from "@/components/dashboard/ListingsManager";
import ProfileManager from "@/components/dashboard/ProfileManager";
import MessagesPanel from "@/components/dashboard/MessagesPanel";
import AdminPanel from "@/components/dashboard/AdminPanel";
import BrokerVerification from "@/components/dashboard/BrokerVerification";
import UserManagement from "@/components/dashboard/UserManagement";
import CommissionsPanel from "@/components/dashboard/CommissionsPanel";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import DocumentReview from "@/components/dashboard/DocumentReview";
import SystemAlerts from "@/components/dashboard/SystemAlerts";
import MyListings from "@/components/dashboard/MyListings";
import AddListing from "@/components/dashboard/AddListing";
import ListingVerification from "@/components/dashboard/ListingVerification";
import BrokerVerificationTasks from "@/components/dashboard/BrokerVerificationTasks";

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("listings");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  const userRole = user.role || "client";
  const userName = user.fullName || "User";

  const SidebarComponent = userRole === "admin" ? AdminSidebar : BrokerSidebar;
  const headerBgClass = userRole === "admin" ? "bg-[hsl(0_84%_60%)]" : "bg-primary";

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block md:w-64 flex-shrink-0">
        <SidebarComponent
          userRole={userRole}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSignOut={signOut}
          userName={userName}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Header */}
        <header className={`${headerBgClass} border-b border-primary/20 shadow-sm`}>
          <div className="px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Mobile Menu Button */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="text-primary-foreground">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SidebarComponent
                    userRole={userRole}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onSignOut={signOut}
                    userName={userName}
                  />
                </SheetContent>
              </Sheet>

              <h1 className="text-lg md:text-xl font-bold text-primary-foreground">
                {userRole === "admin" ? "BIMS Admin Panel" : "BIMS"}
              </h1>
              {userRole === "admin" && (
                <p className="hidden lg:block text-sm text-primary-foreground/80">Broker Information Management System</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors">
                <Bell className="w-5 h-5 text-primary-foreground" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-yellow-500 text-white text-xs">
                  3
                </Badge>
              </button>
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 md:w-10 md:h-10">
                  <AvatarFallback className={userRole === "admin" ? "bg-white text-[hsl(0_84%_60%)]" : "bg-primary-foreground text-primary"}>
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-primary-foreground">{userName}</p>
                  <p className="text-xs text-primary-foreground/70 capitalize">
                    {userRole === "admin" ? "System Administrator" : userRole}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="p-4 md:p-8">
            {/* Admin Routes */}
            {activeTab === "listings" && <DashboardOverview userRole={userRole} />}
            {activeTab === "users" && userRole === "admin" && <UserManagement />}
            {activeTab === "browse" && <ListingsManager userRole={userRole} showAll={true} />}
            {activeTab === "commissions" && <CommissionsPanel />}
            {activeTab === "analytics" && <AnalyticsPanel />}
            {activeTab === "verification" && userRole === "admin" && <ListingVerification />}
            {activeTab === "alerts" && userRole === "admin" && <SystemAlerts />}
            {activeTab === "admin" && userRole === "admin" && <AdminPanel />}

            {/* Broker/Client Routes */}
            {activeTab === "my-listings" && <MyListings />}
            {activeTab === "messages" && <MessagesPanel />}
            {activeTab === "add-listing" && <AddListing />}
            {activeTab === "profile" && <ProfileManager />}
            {activeTab === "verification-status" && userRole === "broker" && <BrokerVerification />}
            {activeTab === "verification" && userRole === "broker" && <BrokerVerificationTasks />}
          </div>
        </main>
      </div>
    </div>
  );
}
