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
    user: {
      name: string;
    };
  };
  client: {
    _id: string;
    name: string;
  };
  amount: number;
  status: "pending" | "paid" | "failed";
  createdAt: string;
}

const CommissionsManagement = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        setLoading(true);
        const response = await api.get("/commissions");
        setCommissions(response.data);
      } catch (error) {
        console.error("Error fetching commissions:", error);
        toast({
          title: "Error",
          description: "Failed to fetch commissions.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, [toast]);

  const handleProcessPayment = async (commissionId: string) => {
    try {
      const response = await api.post(`/commissions/pay/${commissionId}`);
      if (response.data.checkout_url) {
        // Redirect to Chapa payment page
        window.location.href = response.data.checkout_url;
      } else {
        toast({
          title: "Payment Processed",
          description: "The commission has been marked as paid.",
        });
        // Update the commission status locally
        setCommissions(
          commissions.map((c) =>
            c._id === commissionId ? { ...c, status: "paid" } : c
          )
        );
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading commissions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commissions Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Listing</TableHead>
              <TableHead>Broker</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissions.length > 0 ? (
              commissions.map((commission) => (
                <TableRow key={commission._id}>
                  <TableCell>{commission.listing.title}</TableCell>
                  <TableCell>{commission.broker.user.name}</TableCell>
                  <TableCell>{commission.client.name}</TableCell>
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
                        onClick={() => handleProcessPayment(commission._id)}
                      >
                        Pay Now
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No commissions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CommissionsManagement;
