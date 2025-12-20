import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react";
import StatCard from "./StatCard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface Commission {
  _id: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'paid' | 'failed';
  listing: {
    title: string;
    type: string; // Added type for summary breakdown
  };
  createdAt: string;
}

export default function CommissionsPanel() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const { user } = useAuth();

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/commissions');

      if (response.status === 200) {
        setCommissions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch commissions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCommissions();
    }
  }, [user]);

  const handlePayout = async () => {
    setPayoutLoading(true);
    try {
      const response = await api.post('/commissions/payout');

      if (response.status === 200) {
        const data = response.data;
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        }
      } else {
        console.error("Failed to request payout");
      }
    } catch (error) {
      console.error("Failed to request payout", error);
    } finally {
      setPayoutLoading(false);
    }
  };

  const totalEarned = commissions
    .filter(c => c.status === 'paid')
    .reduce((acc, c) => acc + c.amount, 0);

  const pendingAmount = commissions
    .filter(c => c.status === 'pending')
    .reduce((acc, c) => acc + c.amount, 0);

  const paidOut = commissions
    .filter(c => c.status === 'paid')
    .reduce((acc, c) => acc + c.amount, 0);

  if (loading) {
    return <div>Loading commissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Commission Oversight</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Track and manage commission earnings across the platform</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Earned"
          value={`ETB ${totalEarned.toFixed(2)}`}
          subtitle="Lifetime earnings"
          icon={DollarSign}
          iconColor="bg-green-500"
        />
        <StatCard
          title="This Month"
          value={`$${commissions
            .filter(c => {
              const d = new Date(c.createdAt);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && c.status === 'paid';
            })
            .reduce((acc, c) => acc + c.amount, 0)
            .toFixed(2)
            }`}
          change="Real-time"
          trend="up"
          icon={TrendingUp}
          iconColor="bg-blue-500"
        />
        <StatCard
          title="Pending"
          value={`ETB ${pendingAmount.toFixed(2)}`}
          subtitle="Awaiting approval"
          icon={Calendar}
          iconColor="bg-yellow-500"
        />
        <StatCard
          title="Paid Out"
          value={`ETB ${paidOut.toFixed(2)}`}
          subtitle="Successfully transferred"
          icon={CreditCard}
          iconColor="bg-purple-500"
        />
      </div>



      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest commission payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commissions.slice(0, 3).map(commission => (
                <div key={commission._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Commission for: {commission.listing.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(commission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-semibold ${commission.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {commission.status === 'paid' ? '+' : ''}ETB{commission.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission Summary</CardTitle>
            <CardDescription>Breakdown by category (Real Data)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Real Breakdown Logic */}
              {(() => {
                const propertyTotal = commissions
                  .filter(c => c.listing?.type === 'property' && c.status === 'paid')
                  .reduce((acc, c) => acc + c.amount, 0);

                const vehicleTotal = commissions
                  .filter(c => c.listing?.type === 'vehicle' && c.status === 'paid')
                  .reduce((acc, c) => acc + c.amount, 0);

                const otherTotal = commissions
                  .filter(c => !['property', 'vehicle'].includes(c.listing?.type || '') && c.status === 'paid')
                  .reduce((acc, c) => acc + c.amount, 0);

                return (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Properties</span>
                      </div>
                      <span className="font-medium">ETB {propertyTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Vehicles</span>
                      </div>
                      <span className="font-medium">ETB {vehicleTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-sm">Other</span>
                      </div>
                      <span className="font-medium">ETB {otherTotal.toFixed(2)}</span>
                    </div>
                  </>
                );
              })()}

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between font-semibold">
                  <span>Total Earned</span>
                  <span>ETB {totalEarned.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
          <CardDescription>Request a payout for your pending commissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handlePayout}
            disabled={pendingAmount === 0 || payoutLoading}
          >
            {payoutLoading ? "Processing..." : "Request Payout with Chapa"}
          </Button>
        </CardContent>
      </Card>
    </div >
  );
}
