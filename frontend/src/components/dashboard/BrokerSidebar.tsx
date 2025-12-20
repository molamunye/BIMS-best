import { cn } from "@/lib/utils";
import { Building2, LayoutDashboard, List, Search, MessageSquare, DollarSign, Plus, BarChart3, FileCheck, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

interface BrokerSidebarProps {
  userRole: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  userName?: string;
}

import { useEffect, useState } from "react";

export default function BrokerSidebar({ userRole, activeTab, onTabChange, onSignOut, userName }: BrokerSidebarProps) {
  const [stats, setStats] = useState({
    unreadMessages: 0,
    pendingTasks: 0
  });
  // metrics removed per request (DB-driven compact metrics hidden)

  useEffect(() => {
    fetchStats();
    // Poll every minute (only fetchStats)
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/stats');

      if (response.status === 200) {
        const data = response.data;
        setStats({
          unreadMessages: data.unreadMessages || 0,
          pendingTasks: data.pendingTasks || 0
        });
      }
    } catch (error) {
      console.error("Failed to fetch sidebar stats", error);
    }
  };
  // loadMetrics removed
  const menuItems = [
    { id: "listings", label: "Dashboard", icon: LayoutDashboard },
    { id: "my-listings", label: "Listings", icon: List },
    { id: "browse", label: "Browse", icon: Search },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: stats.unreadMessages > 0 ? stats.unreadMessages : undefined },
    { id: "tasks", label: "Verification Tasks", icon: FileCheck, badge: stats.pendingTasks > 0 ? stats.pendingTasks : undefined },
    { id: "verification-note", label: "Verification Task Note", icon: FileCheck },
    { id: "approved-listings", label: "Approved Listings", icon: FileCheck },
    { id: "commissions", label: "Commissions", icon: DollarSign },
    { id: "add-listing", label: "Add Listing", icon: Plus },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="flex flex-col min-h-0 h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/0">
            <img src="/bims-logo.svg" alt="BIMS" className="w-10 h-10 object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">BIMS</h1>
            <p className="text-xs text-muted-foreground">
              {userName || userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Compact metrics removed as requested */}
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all relative",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge className="bg-primary text-primary-foreground">{item.badge}</Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          size="sm"
          onClick={() => onTabChange("settings")}
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
