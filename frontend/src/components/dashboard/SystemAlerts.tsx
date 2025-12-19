import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Bell, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/lib/api";

export default function SystemAlerts() {
  const [alerts, setAlerts] = useState<any>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await api.get('/analytics/alerts');
        setAlerts(response.data);
      } catch (error) {
        console.error("Failed to fetch system alerts:", error);
      }
    };
    fetchAlerts();
  }, []);

  if (!alerts) return <div>Loading alerts...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">System Alerts</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Monitor system health and notifications</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base">System Status</p>
                <p className="text-xs sm:text-sm text-green-600">
                  {alerts.system.status === 'operational' ? 'All systems operational' : 'Issues detected'}
                </p>
                <p className="text-xs text-muted-foreground">Uptime: {Math.floor(alerts.system.uptime / 60)} min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base">Notifications</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{alerts.notifications.unread} unread alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base">Security</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{alerts.security.threats} threats detected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Only show alert if there are unread notifications or non-operational status */}
        {alerts.notifications.unread > 0 && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertTitle className="text-sm sm:text-base">Unread Notifications</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">
              You have {alerts.notifications.unread} unread notifications.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
