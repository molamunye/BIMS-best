import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client"; // Removed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Briefcase, CheckCircle, Clock, XCircle } from "lucide-react";

export default function BrokerageRequest() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [formData, setFormData] = useState({
    business_name: "",
    license_number: "",
  });

  useEffect(() => {
    if (user) {
      checkExistingRequest();
    }
  }, [user]);

  const checkExistingRequest = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const response = await fetch('http://localhost:5000/api/brokers/request/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExistingRequest(data);
      }
    } catch (error) {
      console.error("Failed to check request", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const response = await fetch('http://localhost:5000/api/brokers/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: formData.business_name,
          licenseNumber: formData.license_number
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to submit");
      }

      toast.success("Brokerage request submitted successfully!");
      checkExistingRequest();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> Pending Review</Badge>;
      case "approved":
        return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle className="w-3 h-3" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      default:
        return null;
    }
  };

  if (existingRequest) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Brokerage Request</h2>
          <p className="text-muted-foreground">Your application to become a broker</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Request Status
              </CardTitle>
              {getStatusBadge(existingRequest.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Business Name</Label>
              <p className="font-medium">{existingRequest.businessName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">License Number</Label>
              <p className="font-medium">{existingRequest.licenseNumber || "Not provided"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Submitted On</Label>
              <p className="font-medium">{new Date(existingRequest.createdAt).toLocaleDateString()}</p>
            </div>
            {existingRequest.adminNotes && (
              <div>
                <Label className="text-muted-foreground">Admin Notes</Label>
                <p className="font-medium">{existingRequest.adminNotes}</p>
              </div>
            )}
            {existingRequest.status === "rejected" && (
              <Button onClick={() => setExistingRequest(null)} variant="outline">
                Submit New Request
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Become a Broker</h2>
        <p className="text-muted-foreground">Submit your application to become a verified broker</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Brokerage Application
          </CardTitle>
          <CardDescription>
            Fill in your business details to apply for broker status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                placeholder="Your business or company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_number">License Number (Optional)</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                placeholder="Your broker license number"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
