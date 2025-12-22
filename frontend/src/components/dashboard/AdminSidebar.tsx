import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Shield, LayoutDashboard, Users, Building2, DollarSign, BarChart3, FileCheck, AlertTriangle, Lock, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface AdminSidebarProps {
  userRole?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  userName?: string;
}

export default function AdminSidebar({ activeTab, onTabChange, onSignOut }: AdminSidebarProps) {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    unreadMessages: 0
  });
  // metrics removed per request (DB-driven compact metrics hidden)

  useEffect(() => {
    checkPendingRequests();
    // loadMetrics removed
  }, []);

  const checkPendingRequests = async () => {
    try {
      const response = await api.get('/users/stats');

      if (response.status === 200) {
        const data = response.data;
        setStats({
          pendingRequests: data.pendingBrokers || 0,
          unreadMessages: data.unreadMessages || 0
        });
      }
    } catch (error) {
      console.error("Failed to check pending requests", error);
    }
  };

  // loadMetrics removed

  const menuItems = [
    { id: "listings", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "browse", label: "Listing Management", icon: Building2 },
    { id: "assigned-listings", label: "Assigned Listings", icon: FileCheck },
    { id: "commissions", label: "Commission Oversight", icon: DollarSign },
    { id: "analytics", label: "Analytics & Reports", icon: BarChart3 },
    // Note: AdminSidebar didn't originally have messages, adding it if relevant or just keeping existing structure
    // Adding Messages if desired, but sticking to existing items + adding badges where they make sense
    { id: "verification", label: "Listing Verification", icon: FileCheck },
    { id: "alerts", label: "System Alerts", icon: AlertTriangle },
    { id: "admin", label: "Security & Permissions", icon: Lock, badge: stats.pendingRequests > 0 ? stats.pendingRequests : undefined },
    { id: "profile", label: "Profile", icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-0 h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border bg-destructive text-destructive-foreground">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <img src="/bims-logo.svg" alt="BIMS" className="w-10 h-10 object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold">BIMS Admin Panel</h1>
            <p className="text-xs text-destructive-foreground/80">Broker Information Management System</p>
          </div>
        </div>
      </div>

      {/* Admin Badge */}
      <div className="px-4 py-3 bg-sidebar-accent border-b border-sidebar-border">
        <div className="flex items-center gap-2 text-xs">
          <Shield className="w-4 h-4 text-destructive" />
          <span className="font-medium text-destructive">Admin Access</span>
        </div>
        <p className="text-xs text-sidebar-foreground/70 mt-1">Full system management privileges</p>
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
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-destructive text-destructive-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-bold",
                  isActive ? "bg-white text-destructive" : "bg-destructive text-destructive-foreground"
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          size="sm"
          onClick={() => onTabChange("settings")}
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          size="sm"
          onClick={onSignOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          home page
        </Button>
      </div>
    </div>
  );
}
