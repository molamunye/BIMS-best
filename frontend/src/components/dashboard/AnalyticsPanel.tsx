import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Eye, MessageSquare, TrendingUp, Users, Building, DollarSign } from "lucide-react";
import StatCard from "./StatCard";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function AnalyticsPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoint = user?.role === 'admin' ? '/analytics/admin' : '/analytics/broker';
        const response = await api.get(endpoint);
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) return <div>Loading analytics...</div>;
  if (!stats) return <div>Failed to load analytics.</div>;

  // Render logic based on role
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Analytics</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Platform-wide performance metrics</p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.users.total.toString()}
            subtitle={`${stats.users.active} active users`}
            icon={Users}
            iconColor="bg-blue-500"
          />
          <StatCard
            title="Total Listings"
            value={stats.listings.total.toString()}
            subtitle={`${stats.listings.active} active listings`}
            icon={Building}
            iconColor="bg-green-500"
          />
          <StatCard
            title="Total Messages"
            value={stats.messages.total.toString()}
            subtitle="Platform wide"
            icon={MessageSquare}
            iconColor="bg-purple-500"
          />
          <StatCard
            title="Revenue"
            value={`ETB ${stats.financials.totalRevenue.toLocaleString()}`}
            subtitle="Total Commission"
            icon={DollarSign}
            iconColor="bg-orange-500"
          />
        </div>
        {/* Placeholder for graphs if needed later */}
      </div>
    );
  }

  // Broker View
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Broker Analytics</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Track your performance and earnings</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Assigned Listings"
          value={stats.listings.assigned.toString()}
          subtitle={`${stats.listings.verified} verified`}
          icon={Building}
          iconColor="bg-blue-500"
        />
        <StatCard
          title="Total Earned"
          value={`ETB ${stats.financials.totalEarned.toLocaleString()}`}
          subtitle={`ETB ${stats.financials.pending.toLocaleString()} pending`}
          icon={DollarSign}
          iconColor="bg-green-500"
        />
        <StatCard
          title="Messages"
          value={stats.messages.received.toString()}
          subtitle="Received"
          icon={MessageSquare}
          iconColor="bg-purple-500"
        />
        <StatCard
          title="Performance"
          value="Good"
          subtitle="Based on activity"
          icon={TrendingUp}
          iconColor="bg-orange-500"
        />
      </div>
    </div>
  );
}
