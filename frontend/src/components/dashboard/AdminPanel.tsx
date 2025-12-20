import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client"; // Removed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, FileCheck, Building2 } from "lucide-react";
import api from "@/lib/api";

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, brokers: 0, listings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, statsRes, requestsRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/stats'),
        api.get('/brokers/requests'),
      ]);

      if (usersRes.status === 200) {
        setUsers(usersRes.data);
      }

      if (statsRes.status === 200) {
        const statsData = statsRes.data;
        setStats({
          users: statsData.totalUsers || 0,
          brokers: statsData.totalBrokers || 0,
          listings: statsData.activeListings || 0,
        });
      }

      if (requestsRes.status === 200) {
        const requestsData = requestsRes.data;
        // Filter only pending requests
        if (Array.isArray(requestsData)) {
          setVerifications(requestsData.filter((r: any) => r.status === 'pending'));
        }
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: "admin" | "broker" | "client") => {
    try {
      const response = await api.put(`/users/${userId}/role`, { role: newRole });

      if (response.status !== 200) throw new Error("Failed to update role");

      toast.success("User role updated");
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update role");
    }
  };

  const handleVerification = async (verificationId: string, status: "approved" | "rejected") => {
    try {
      const response = await api.put(`/brokers/requests/${verificationId}`, { status });

      if (response.status !== 200) throw new Error("Failed to update request");

      toast.success(`Request ${status}`);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update request");
    }
  };

  if (loading) return <div>Loading admin panel...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified Brokers</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.brokers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.listings}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="verifications">
            Verifications
            {verifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {verifications.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {users.map((user) => (
            <Card key={user._id || user.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="capitalize">
                    {user.role || "client"}
                  </Badge>
                  <Select
                    defaultValue={user.role || "client"}
                    onValueChange={(value) => updateUserRole(user._id || user.id, value as "admin" | "broker" | "client")}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="broker">Broker</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="verifications" className="space-y-4">
          {verifications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending verifications
              </CardContent>
            </Card>
          ) : (
            verifications.map((verification) => (
              <Card key={verification._id || verification.id}>
                <CardHeader>
                  <CardTitle className="text-base">{verification.userId?.fullName || 'Unknown User'}</CardTitle>
                  <p className="text-sm text-muted-foreground">{verification.userId?.email || 'No Email'}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Business Name</p>
                    <p className="text-sm text-muted-foreground">{verification.businessName}</p>
                  </div>
                  {verification.licenseNumber && (
                    <div>
                      <p className="text-sm font-medium">License Number</p>
                      <p className="text-sm text-muted-foreground">{verification.licenseNumber}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleVerification(verification._id || verification.id, "approved")}
                      variant="default"
                      size="sm"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleVerification(verification._id || verification.id, "rejected")}
                      variant="destructive"
                      size="sm"
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
