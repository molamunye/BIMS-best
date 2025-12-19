import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
// Supabase import removed
import StatCard from "./StatCard";
import { Building, Users, MessageSquare, TrendingUp, FileCheck, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardOverviewProps {
  userRole: string;
  onNavigate?: (tab: string) => void;
}

export default function DashboardOverview({ userRole, onNavigate }: DashboardOverviewProps) {
  const { user } = useAuth();
  interface StatsState {
    activeListings: number;
    totalUsers: number;
    pendingBrokers: number;
    totalMessages: number;
    assignedListings: number;
    totalBrokers: number;
    commissions: number;
    recentActivity: any[];
    pendingTasks: number;
    metrics?: any;
  }

  const [stats, setStats] = useState<StatsState>({
    activeListings: 0,
    totalUsers: 0,
    pendingBrokers: 0,
    totalMessages: 0,
    assignedListings: 0,
    totalBrokers: 0,
    commissions: 0,
    recentActivity: [],
    pendingTasks: 0,
  });

  useEffect(() => {
    loadStats();
  }, [user, userRole]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const response = await fetch('http://localhost:5000/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        if (userRole === "admin") {
          setStats({
            activeListings: data.activeListings || 0,
            totalUsers: data.totalUsers || 0,
            pendingBrokers: data.pendingBrokers || 0,
            totalMessages: 0, // Admin might not see messages count or we didn't send it
            assignedListings: data.assignedListings || 0,
            totalBrokers: data.totalBrokers || 0,
            commissions: 0,
            recentActivity: data.recentActivity || [],
            pendingTasks: 0,
          });
        } else if (userRole === "broker") {
          setStats({
            activeListings: data.activeListings || 0,
            totalUsers: data.totalUsers || 0,
            pendingBrokers: 0,
            totalMessages: data.totalMessages || 0,
            assignedListings: 0,
            totalBrokers: 0,
            commissions: data.commissions || 0,
            recentActivity: data.recentActivity || [],
            pendingTasks: data.pendingTasks || 0,
          });
          // Update the cards below to use these values
        } else {
          setStats({
            activeListings: data.platformActiveListings || 0, // For client showing total platform listings
            totalUsers: data.totalUsers || 0, // Maybe not relevant for client
            pendingBrokers: 0,
            totalMessages: 0,
            assignedListings: 0,
            totalBrokers: 0,
            commissions: 0,
            recentActivity: data.recentActivity || [],
            pendingTasks: 0,
          });
        }
        // Fetch public metrics to populate percent-change and commission deltas
        try {
          const metricsRes = await fetch('http://localhost:5000/api/public/metrics');
          if (metricsRes.ok) {
            const metrics = await metricsRes.json();
            // attach to state for use in UI (we'll store in a top-level property)
            setStats(prev => ({ ...prev, metrics }));
          }
        } catch (e) {
          console.error('Failed to load public metrics', e);
        }
      }
    } catch (error) {
      console.error("Failed to load stats", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return Users;
      case 'listing': return Building;
      case 'request': return Shield;
      case 'message': return MessageSquare;
      default: return TrendingUp;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return "text-blue-500 bg-blue-100";
      case 'listing': return "text-green-500 bg-green-100";
      case 'request': return "text-orange-500 bg-orange-100";
      case 'message': return "text-purple-500 bg-purple-100";
      default: return "text-gray-500 bg-gray-100";
    }
  };

  const getQuickActions = () => {
    if (userRole === 'admin') {
      return [
        { label: "Review Applications", count: stats.pendingBrokers, icon: Shield, action: "admin", color: "bg-orange-500" },
        { label: "Manage Users", count: stats.totalUsers, icon: Users, action: "users", color: "bg-blue-500" },
        { label: "Approve Listings", count: stats.assignedListings, icon: FileCheck, action: "verification", color: "bg-green-500" }
      ];
    } else if (userRole === 'broker') {
      return [
        { label: "Browse Listings", count: null, icon: Building, action: "browse", color: "bg-blue-500" },
        { label: "Messages", count: stats.totalMessages, icon: MessageSquare, action: "messages", color: "bg-purple-500" },
        { label: "Verification Tasks", count: stats.pendingTasks || null, icon: FileCheck, action: "tasks", color: "bg-green-500" }
      ];
    } else {
      return [
        { label: "Add Listing", count: null, icon: Building, action: "add-listing", color: "bg-primary" },
        { label: "Browse Listings", count: stats.activeListings, icon: Users, action: "browse", color: "bg-green-500" },
        { label: "My Listings", count: null, icon: FileCheck, action: "my-listings", color: "bg-orange-500" }
      ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {userRole === "admin" ? "BIMS Admin Dashboard" : `Welcome back${userRole === "broker" ? ", Broker" : ""}!`}
          </h2>
          <p className="text-muted-foreground mt-1">
            {userRole === "admin" ? "Complete platform oversight and management" : "Manage your listings and commissions"}
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => userRole === "broker" ? onNavigate?.("add-listing") : loadStats()}
        >
          <Building className="w-4 h-4 mr-2" />
          {userRole === "broker" ? "Add New Listing" : "Refresh Data"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {userRole === "admin" ? (
          <>
            <StatCard
              title="Total Brokers"
              value={stats.totalBrokers}
              subtitle={`${stats.totalBrokers} verified brokers`}
              change={stats.metrics ? `${stats.metrics.activeChangePct ?? 0}%` : '+0%'}
              icon={Users}
              iconColor="bg-blue-500"
              trend={stats.metrics ? (stats.metrics.activeChangePct > 0 ? 'up' : stats.metrics.activeChangePct < 0 ? 'down' : 'neutral') : undefined}
            />
            <StatCard
              title="Assigned Listings"
              value={stats.assignedListings}
              subtitle={`${stats.assignedListings} under review`}
              change="In progress"
              icon={FileCheck}
              iconColor="bg-yellow-500"
              trend="neutral"
            />
            <StatCard
              title="Active Listings"
              value={stats.activeListings}
              subtitle="Total listings"
              change={stats.metrics ? `${stats.metrics.activeChangePct ?? 0}%` : '+0%'}
              icon={Building}
              iconColor="bg-green-500"
              trend={stats.metrics ? (stats.metrics.activeChangePct > 0 ? 'up' : stats.metrics.activeChangePct < 0 ? 'down' : 'neutral') : undefined}
            />
            <StatCard
              title="Pending Brokers"
              value={stats.pendingBrokers}
              subtitle="Awaiting verification"
              change="Needs attention"
              icon={Shield}
              iconColor="bg-purple-500"
              trend="neutral"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Active Listings"
              value={stats.activeListings}
              change={stats.metrics ? `+${stats.metrics.activeChangePct ?? 0}% from last month` : '+0% from last month'}
              icon={Building}
              iconColor="bg-blue-500"
              trend={stats.metrics ? (stats.metrics.activeChangePct > 0 ? 'up' : stats.metrics.activeChangePct < 0 ? 'down' : 'neutral') : undefined}
            />
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              change={stats.metrics ? `Total registered clients: ${stats.metrics.totalClients ?? 0}` : 'Total registered clients'}
              icon={Users}
              iconColor="bg-green-500"
              trend="up"
            />
            <StatCard
              title="Commissions"
              value={stats.metrics ? new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(stats.metrics.commissionTotal ?? 0) : `ETB ${stats.commissions.toLocaleString()}`}
              change={stats.metrics ? `${stats.metrics.commissionChangePct ?? 0}% from last month` : '+0% initially'}
              icon={TrendingUp}
              iconColor="bg-primary"
              trend={stats.metrics ? (stats.metrics.commissionChangePct > 0 ? 'up' : stats.metrics.commissionChangePct < 0 ? 'down' : 'neutral') : undefined}
            />
            <StatCard
              title="Growth"
              value={stats.metrics ? `${stats.metrics.growthPct ?? 0}%` : '0%'}
              change={stats.metrics ? `+${stats.metrics.activeChangePct ?? 0}% from last month` : '+0% from last month'}
              icon={TrendingUp}
              iconColor="bg-purple-500"
              trend={stats.metrics ? (stats.metrics.growthPct > 0 ? 'up' : stats.metrics.growthPct < 0 ? 'down' : 'neutral') : undefined}
            />
          </>
        )}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getQuickActions().map((action, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate?.(action.action)}
                className="w-full p-3 sm:p-4 rounded-lg bg-sidebar-accent/10 border border-border flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between hover:bg-sidebar-accent/20 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center flex-shrink-0`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base">{action.label}</p>
                    {action.count !== null && (
                      <p className="text-xs sm:text-sm text-muted-foreground">{action.count} items</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* @ts-ignore */}
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              // @ts-ignore
              stats.recentActivity.map((activity, idx) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.time)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
