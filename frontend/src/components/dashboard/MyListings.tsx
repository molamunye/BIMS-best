import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client"; // Removed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ListingCard from "./ListingCard";
import { toast } from "sonner";

export default function MyListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadMyListings();
    }
  }, [user]);

  const loadMyListings = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const response = await fetch(`http://localhost:5000/api/listings?owner=${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to fetch listings");

      const data = await response.json();
      setListings(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load listings");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Listings</h2>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Listing
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listings.length === 0 ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No Listings Yet</CardTitle>
              <CardDescription>Start by creating your first listing</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              canEdit={true}
              onDeleted={loadMyListings}
              onUpdated={loadMyListings}
            />
          ))
        )}
      </div>
    </div>
  );
}
