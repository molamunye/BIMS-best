import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import StatCard from "./StatCard";

export default function DocumentReview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Document Review</h2>
        <p className="text-muted-foreground">Review and approve broker verification documents</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Pending Review"
          value="8"
          subtitle="Awaiting approval"
          icon={Clock}
        />
        <StatCard
          title="Approved"
          value="145"
          subtitle="All time"
          icon={CheckCircle}
        />
        <StatCard
          title="Rejected"
          value="12"
          subtitle="All time"
          icon={XCircle}
        />
        <StatCard
          title="Total Docs"
          value="165"
          subtitle="Processed"
          icon={FileText}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
          <CardDescription>Documents awaiting your review</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No pending verification documents.</p>
        </CardContent>
      </Card>
    </div>
  );
}
