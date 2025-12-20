import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client"; // Removed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";

export default function BrokerVerification() {
  const { user } = useAuth();
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    licenseNumber: "",
  });

  useEffect(() => {
    loadVerification();
  }, [user]);

  const loadVerification = async () => {
    if (!user) return;
    try {
      const response = await api.get('/brokers/request/me');

      if (response.status === 200) {
        const data = response.data;
        if (data) {
          setVerification(data);
          setFormData({
            businessName: data.businessName,
            licenseNumber: data.licenseNumber || "",
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const response = await api.post('/brokers/request', formData);

      if (response.status !== 200 && response.status !== 201) {
        const errorData = response.data;
        throw new Error(errorData.message || "Failed to submit verification");
      }

      toast.success("Verification request submitted");
      loadVerification();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (verification) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Broker Verification Status</CardTitle>
          <CardDescription>Your verification request is being reviewed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <Badge
              variant={
                verification.status === "approved"
                  ? "default"
                  : verification.status === "rejected"
                    ? "destructive"
                    : "secondary"
              }
              className="capitalize"
            >
              {verification.status}
            </Badge>
          </div>
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
          {verification.adminNotes && (
            <div>
              <p className="text-sm font-medium">Admin Notes</p>
              <p className="text-sm text-muted-foreground">{verification.adminNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Request Broker Verification</CardTitle>
        <CardDescription>
          Submit your business details to become a verified broker
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="license_number">License Number (Optional)</Label>
            <Input
              id="license_number"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Verification Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
