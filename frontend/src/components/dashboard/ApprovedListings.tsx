import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client"; // Removed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, MapPin, User, Clock, Search } from "lucide-react";
import { formatETB } from "@/lib/utils";
import { toast } from "sonner"; // Added toast

export default function ApprovedListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadApprovedListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [searchQuery, listings]);

  const loadApprovedListings = async () => {
    setLoading(true);
    try {
      // Only show approved listings that have been paid
      const response = await fetch('http://localhost:5000/api/listings?verificationStatus=approved&status=active');
      if (!response.ok) throw new Error("Failed to fetch listings");
      const data = await response.json();
      setListings(data || []);
      setFilteredListings(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load approved listings");
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

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Approved Listings</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Listings that have been verified and approved</p>
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
            <CardTitle>{searchQuery ? "No Results" : "No Approved Listings"}</CardTitle>
            <CardDescription>
              {searchQuery
                ? `No listings found matching "${searchQuery}"`
                : "There are no approved listings at this time."}
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
                  <Badge className="bg-green-500 flex-shrink-0">Approved</Badge>
                </div>
                <CardDescription className="flex items-center gap-1 text-xs sm:text-sm">
                  <MapPin className="w-3 h-3" />
                  {listing.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                <p className="text-lg sm:text-xl font-bold text-primary">
                  {formatETB(listing.price)}
                </p>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                  <User className="w-3 h-3" />
                  {listing.owner?.fullName || "Unknown"}
                </div>
                {listing.verified_at && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Approved: {new Date(listing.verified_at).toLocaleDateString()}
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
