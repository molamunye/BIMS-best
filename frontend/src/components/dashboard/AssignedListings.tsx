import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
// import { supabase } from "@/integrations/supabase/client"; // Removed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, MapPin, User, Clock, CheckCircle, XCircle, Search } from "lucide-react";
import { formatETB } from "@/lib/utils";
import { toast } from "sonner";

interface AssignedListingsProps {
  isAdmin?: boolean;
}

export default function AssignedListings({ isAdmin = false }: AssignedListingsProps) {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      loadAssignedListings();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    filterListings();
  }, [searchQuery, listings]);

  const loadAssignedListings = async () => {
    setLoading(true);
    try {
      let url = '/listings?verificationStatus=assigned';

      if (!isAdmin && user) {
        url += `&assignedBroker=${user.id}`;
      }

      const response = await api.get(url);
      setListings(response.data || []);
      setFilteredListings(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assigned listings");
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    if (!searchQuery.trim()) {
      setFilteredListings(listings);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = listings.filter((listing) => {
      return (
        listing.title?.toLowerCase().includes(query) ||
        listing.location?.toLowerCase().includes(query) ||
        listing.owner?.fullName?.toLowerCase().includes(query)
      );
    });
    setFilteredListings(filtered);
  };

  const handleVerify = async (listingId: string, status: "approved" | "rejected") => {
    try {
      await api.put(`/listings/${listingId}/verify`, { status });
      toast.success(`Listing ${status} successfully`);
      loadAssignedListings();
    } catch (error: any) {
      toast.error(error.message || "Failed to update listing");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {isAdmin ? "All Assigned Listings" : "My Assigned Listings"}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            {isAdmin ? "View all listings assigned to brokers" : "Listings assigned to you for verification"}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{searchQuery ? "No Results" : "No Assigned Listings"}</CardTitle>
            <CardDescription>
              {searchQuery
                ? `No listings found matching "${searchQuery}"`
                : isAdmin
                  ? "No listings have been assigned to brokers yet."
                  : "You don't have any listings assigned to you."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <Card key={listing._id || listing.id} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <CardHeader className="pb-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg line-clamp-1">{listing.title}</CardTitle>
                  <Badge variant={listing.verificationStatus === "approved" ? "default" : "secondary"} className="flex-shrink-0">
                    {listing.verificationStatus || "Pending"}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1 text-xs sm:text-sm">
                  <MapPin className="w-3 h-3" />
                  {listing.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                <p className="text-lg sm:text-xl font-bold text-primary">
                  {formatETB(listing.price)}
                </p>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                  <User className="w-3 h-3" />
                  Created by: {listing.owner?.fullName || "Unknown"}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(listing.createdAt).toLocaleDateString()}
                </div>
                {!isAdmin && listing.verificationStatus === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleVerify(listing._id || listing.id, "approved")}
                      className="flex-1 gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleVerify(listing._id || listing.id, "rejected")}
                      className="flex-1 gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
