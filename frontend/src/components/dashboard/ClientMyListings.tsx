import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, MapPin, Clock, Search } from "lucide-react";
import { formatETB } from "@/lib/utils";

export default function ClientMyListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      loadMyListings();
    }
  }, [user]);

  useEffect(() => {
    filterListings();
  }, [searchQuery, listings]);

  const loadMyListings = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/listings?owner=${user?.id}`);
      setListings(response.data || []);
      setFilteredListings(response.data || []);
    } catch (error) {
      console.error(error);
      // toast.error("Failed to load listings");
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
        listing.type?.toLowerCase().includes(query)
      );
    });
    setFilteredListings(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "secondary",
      sold: "outline",
      inactive: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getVerificationBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Not Verified</Badge>;
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">My Listings</h2>
          <p className="text-muted-foreground text-sm sm:text-base">View all listings you have created</p>
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
            <CardTitle>{searchQuery ? "No Results" : "No Listings Yet"}</CardTitle>
            <CardDescription>
              {searchQuery
                ? `No listings found matching "${searchQuery}"`
                : "You haven't created any listings. Go to \"Add Listing\" to create one."}
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
                  <CardTitle className="text-base sm:text-lg line-clamp-1 break-words">{listing.title}</CardTitle>
                  {getStatusBadge(listing.status)}
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
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Verification:</span>
                  {getVerificationBadge(listing.verificationStatus)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(listing.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
