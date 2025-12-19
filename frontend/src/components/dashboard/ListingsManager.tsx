import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ListingForm from "./ListingForm";
import ListingCard from "./ListingCard";
import { toast } from "sonner";

interface ListingsManagerProps {
  userRole: string;
  showAll?: boolean;
}

export default function ListingsManager({ userRole, showAll }: ListingsManagerProps) {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  useEffect(() => {
    loadListings();
  }, [user]);

  useEffect(() => {
    filterListings();
  }, [searchQuery, listings, typeFilter, minPrice, maxPrice]);

  const loadListings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      // Construct query params
      let url = 'http://localhost:5000/api/listings?';

      if (showAll) {
        // Force "Browse" mode: show all active and approved listings
        // Backend handles refined payment status visibility
        url += 'status=active&verificationStatus=approved';
      } else if (userRole === 'broker') {
        url += `owner=${user.id}`;
      } else if (userRole === 'client') {
        // Client browsing: show all active and approved listings
        url += 'status=active&verificationStatus=approved';
      } else if (userRole === "admin") {
        url = 'http://localhost:5000/api/listings';
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setListings(data || []);
      setFilteredListings(data || []);

    } catch (error) {
      toast.error("Failed to load listings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((listing) => {
        return (
          listing.title?.toLowerCase().includes(query) ||
          listing.description?.toLowerCase().includes(query) ||
          listing.location?.toLowerCase().includes(query) ||
          listing.type?.toLowerCase().includes(query) ||
          listing.owner?.fullName?.toLowerCase().includes(query)
        );
      });
    }

    // Type filter
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((listing) => listing.type === typeFilter);
    }

    // Price filters
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter((listing) => listing.price >= min);
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter((listing) => listing.price <= max);
      }
    }

    setFilteredListings(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setMinPrice("");
    setMaxPrice("");
  };

  const hasActiveFilters = searchQuery || typeFilter !== "all" || minPrice || maxPrice;

  const handleListingCreated = () => {
    setDialogOpen(false);
    loadListings();
    toast.success("Listing created successfully");
  };

  const handleListingDeleted = (id: string) => {
    setListings(listings.filter(l => (l._id || l.id) !== id));
  };

  if (loading) return <div className="flex items-center justify-center p-8">Loading listings...</div>;

  const canCreateListing = userRole === "broker";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h2 className="text-2xl font-bold">
          {showAll || userRole === "client" ? "Browse Listings" : "My Listings"}
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          {canCreateListing && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  New Listing
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Listing</DialogTitle>
                </DialogHeader>
                <ListingForm onSuccess={handleListingCreated} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <div className="flex items-center gap-2">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  Active
                </span>
              )}
            </Button>
          </CollapsibleTrigger>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <CollapsibleContent className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                      <SelectItem value="vehicle">Vehicle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Min Price</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Price</Label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {filteredListings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {hasActiveFilters ? `No listings found matching your criteria` : "No listings found"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing._id || listing.id}
              listing={listing}
              canEdit={userRole === "broker" || userRole === "admin"}
              onDeleted={handleListingDeleted}
              onUpdated={loadListings}
            />
          ))}
        </div>
      )}
    </div>
  );
}