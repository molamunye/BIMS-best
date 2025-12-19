import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Car, Home, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { formatETB } from "@/lib/utils";

const Listings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      // Fetch active, approved listings (fetch more than 3 to allow selecting the newest ones)
      const response = await fetch(
        'http://localhost:5000/api/listings?status=active&verificationStatus=approved&limit=20'
      );
      if (!response.ok) throw new Error("Failed to fetch listings");
      const data = await response.json();

      // Sort by creation date descending (newest first) and take only the top 3
      const sortedListings = (data || [])
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.date).getTime();
          const dateB = new Date(b.createdAt || b.date).getTime();
          return dateB - dateA; // Newest first
        })
        .slice(0, 3);

      setListings(sortedListings);
    } catch (error) {
      console.error("Failed to load listings:", error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: number | string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/listings/${id}`);
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Featured Listings
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our curated selection of verified properties and vehicles.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No listings available at the moment.</p>
            <p className="text-sm mt-2">Check back later for new listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing) => (
              <Card
                key={listing._id || listing.id}
                className="overflow-hidden hover:shadow-card transition-all duration-300 hover:-translate-y-1 border-border"
              >
                <div className="relative h-56 overflow-hidden bg-muted">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Home className="w-12 h-12" />
                    </div>
                  )}
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    {listing.type === 'property' ? (
                      <><Home className="w-3 h-3 mr-1" /> Property</>
                    ) : (
                      <><Car className="w-3 h-3 mr-1" /> Vehicle</>
                    )}
                  </Badge>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-card-foreground line-clamp-2">
                    {listing.title}
                  </h3>

                  <div className="flex items-center text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{listing.location}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    {listing.type === 'property' && listing.metadata ? (
                      <>
                        {listing.metadata.bedrooms && (
                          <div className="flex items-center">
                            <Bed className="w-4 h-4 mr-1" />
                            {listing.metadata.bedrooms} Beds
                          </div>
                        )}
                        {listing.metadata.bathrooms && (
                          <div className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            {listing.metadata.bathrooms} Baths
                          </div>
                        )}
                      </>
                    ) : listing.type === 'vehicle' && listing.metadata ? (
                      <>
                        {listing.metadata.year && <div>{listing.metadata.year}</div>}
                        {listing.metadata.mileage && <div>{listing.metadata.mileage} km</div>}
                      </>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      {formatETB(listing.price)}
                    </div>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => handleViewDetails(listing._id || listing.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => navigate('/all-listings')} // Adjust route if needed
          >
            View All Listings
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Listings;