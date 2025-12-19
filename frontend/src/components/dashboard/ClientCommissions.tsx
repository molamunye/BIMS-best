import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Commission {
  _id: string;
  listing: {
    _id: string;
    title: string;
    price: number;
  };
  broker: {
    _id: string;
    fullName: string; // Adjusted to match controller population
  };
  amount: number;
  status: "pending" | "paid" | "failed" | "in_progress";
  createdAt: string;
}

const ClientCommissions = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        setLoading(true);
        // This endpoint gets commissions for the logged-in user (client/seller)
        const response = await api.get("/commissions");
        setCommissions(response.data);
      } catch (error) {
        console.error("Error fetching commissions:", error);
        toast({
          title: "Error",
          description: "Failed to fetch your commissions.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, [toast]);

  const handlePayCommission = async (commissionId: string) => {
    try {
      const response = await api.post(`/commissions/${commissionId}/pay`);
      if (response.data.checkout_url) {
        // Redirect to the Chapa payment page
        window.location.href = response.data.checkout_url;
      } else {
        toast({
          title: "Error",
          description: "Could not retrieve payment URL.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. You may not be authorized or the commission is not pending.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading your commissions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Commissions</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          These are the commissions you owe for your listings.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Listing</TableHead>
              <TableHead>Broker</TableHead>
              <TableHead>Commission Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissions.length > 0 ? (
              commissions.map((commission) => (
                <TableRow key={commission._id}>
                  <TableCell>{commission.listing.title}</TableCell>
                  <TableCell>{commission.broker.fullName}</TableCell>
                  <TableCell>ETB {commission.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        commission.status === "paid"
                          ? "default"
                          : commission.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {commission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(commission.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {commission.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handlePayCommission(commission._id)}
                      >
                        Pay Now
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  You have no pending commissions.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ClientCommissions;
