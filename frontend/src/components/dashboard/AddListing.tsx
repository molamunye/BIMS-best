import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ListingForm from "./ListingForm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function AddListing() {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    toast.success("Listing created successfully!");
    // Could navigate to my-listings or stay here
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Add New Listing</h2>
        <p className="text-muted-foreground">Create a new property listing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
          <CardDescription>Fill in the information below to create your listing</CardDescription>
        </CardHeader>
        <CardContent>
          <ListingForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
