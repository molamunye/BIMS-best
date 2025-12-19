import { cn } from "@/lib/utils";
import { Building2, LayoutDashboard, List, MessageSquare, User, Shield, FileCheck, Bell, Settings, LogOut, PlusCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  userRole: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  userName?: string;
}

import { useEffect, useState } from "react";

export default function Sidebar({ userRole, activeTab, onTabChange, onSignOut, userName }: SidebarProps) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [stats, setStatsState] = useState<any>({
    activeListings: 0,
    activeLast30: 0,
    activeChangePct: 0,
    totalUsers: 0,
    totalClients: 0,
    commissions: 0,
    commissionChangePct: 0,
    growthPct: 0,
  });
  const [loadingStatsSidebar, setLoadingStatsSidebar] = useState(true);

  useEffect(() => {
    fetchStats();
    const onMessagesUpdated = () => fetchStats();
    window.addEventListener('messagesUpdated', onMessagesUpdated as EventListener);
    return () => window.removeEventListener('messagesUpdated', onMessagesUpdated as EventListener);
  }, []);

  const fetchStats = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/users/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadMessages(data.unreadMessages || 0);
        // Map available fields into a compact stats object for the sidebar
        setStatsState({
          activeListings: data.activeListings ?? data.platformActiveListings ?? 0,
          activeLast30: data.activeLast30 ?? 0,
          activeChangePct: data.activeChangePct ?? (data.metrics?.activeChangePct ?? 0),
          // Prefer direct totalUsers, fall back to platform totals when provided
          totalUsers: data.totalUsers ?? data.platformTotalUsers ?? data.totalUsers ?? 0,
          totalClients: data.totalClients ?? data.platformTotalClients ?? 0,
          commissions: data.commissions ?? (data.metrics?.commissionTotal ?? 0),
          commissionChangePct: data.commissionChangePct ?? (data.metrics?.commissionChangePct ?? 0),
          growthPct: data.growthPct ?? (data.metrics?.growthPct ?? 0),
        });
        setLoadingStatsSidebar(false);
      }
    } catch (error) {
      console.error("Failed to fetch sidebar stats", error);
    }
  };
  const menuItems = [
    { id: "listings", label: "Dashboard", icon: LayoutDashboard, roles: ["client", "broker", "admin"] },
    { id: "browse", label: userRole === "broker" ? "Listings" : "Browse", icon: List, roles: ["client", "broker", "admin"] },
    { id: "add-listing", label: "Add Listing", icon: PlusCircle, roles: ["client"] },
    { id: "my-listings", label: "My Listings", icon: Building2, roles: ["client"] },
    { id: "commissions", label: "My Commissions", icon: DollarSign, roles: ["client"] },
    { id: "brokerage-request", label: "Become a Broker", icon: FileCheck, roles: ["client"] },
    { id: "messages", label: "Messages", icon: MessageSquare, roles: ["client", "broker", "admin"], badge: unreadMessages > 0 ? unreadMessages : undefined },
    { id: "profile", label: "Profile", icon: User, roles: ["client", "broker", "admin"] },
    { id: "verification", label: "Verification", icon: FileCheck, roles: ["broker"] },
    { id: "admin", label: "Admin Panel", icon: Shield, roles: ["admin"] },
  ];

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/0">
            <img src="/bims-logo.svg" alt="BIMS" className="w-10 h-10 object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">BIMS</h1>
            <p className="text-xs text-muted-foreground">Broker Information System</p>
          </div>
        </div>
      </div>

      {/* Compact Metrics for dashboards (DB-driven) - hide for clients */}
      {userRole !== 'client' && (
        <div className="px-4 py-3 border-b border-sidebar-border bg-muted/30">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Active Listings</div>
            <div className="text-sm font-bold">{loadingStatsSidebar ? '...' : stats.activeListings ?? 0}</div>
            <div className="text-xs text-muted-foreground">{loadingStatsSidebar ? '' : `${stats.activeLast30 ?? 0} new · ${stats.activeChangePct ?? 0}% from last month`}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Total Users</div>
            <div className="text-sm font-bold">{loadingStatsSidebar ? '...' : stats.totalUsers ?? 0}</div>
            <div className="text-xs text-muted-foreground">Total registered clients: {loadingStatsSidebar ? '...' : stats.totalClients ?? 0}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Commissions</div>
            <div className="text-sm font-bold">{loadingStatsSidebar ? '...' : new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(stats.commissions ?? 0)}</div>
            <div className="text-xs text-muted-foreground">{loadingStatsSidebar ? '' : `${stats.commissionChangePct ?? 0}% from last month`}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Growth</div>
            <div className="text-sm font-bold">{loadingStatsSidebar ? '...' : `${stats.growthPct ?? 0}%`}</div>
            <div className="text-xs text-muted-foreground">{loadingStatsSidebar ? '' : `+${stats.activeChangePct ?? 0}% from last month`}</div>
          </div>
        </div>
      </div>
      )}

      {/* User Info */}
      {userRole === "admin" && (
        <div className="px-4 py-3 bg-muted/50 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-medium">Admin Access</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Full system management privileges</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {/* @ts-ignore */}
              {item.badge && (
                <Badge className="bg-primary text-primary-foreground">
                  {/* @ts-ignore */}
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button
          onClick={() => onTabChange("settings")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "settings"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          size="sm"
          onClick={onSignOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
