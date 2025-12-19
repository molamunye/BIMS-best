import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MessageForm from "./MessageForm";
import { MapPin, MessageSquare } from "lucide-react";
import { formatETB } from "@/lib/utils";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

interface ListingDetailDialogProps {
  listingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ListingDetailDialog({
  listingId,
  open,
  onOpenChange,
}: ListingDetailDialogProps) {
  const { user } = useAuth();
  const [listing, setListing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMessageForm, setShowMessageForm] = useState(false);

  useEffect(() => {
    if (open && listingId) {
      loadListing();
    }
  }, [open, listingId]);

  const loadListing = async () => {
    setLoading(true);
    try {
      // Use API instead of Supabase
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      // Note: Endpoint needs to be added to backend routes! 
      // Assuming GET /api/listings/:id exists now
      const response = await fetch(`http://localhost:5000/api/listings/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setListing(data);
      }
    } catch (error) {
      console.error("Failed to load listing", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center p-8">
            Loading...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{listing.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Images */}
          {listing.images && listing.images.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {listing.images.slice(0, 4).map((image: string, idx: number) => (
                <ImageWithFallback
                  key={idx}
                  src={image}
                  alt={`${listing.title} - ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Price and Location */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {formatETB(listing.price)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">{listing.location}</span>
            </div>
            <Badge variant="outline" className="capitalize">
              {listing.type}
            </Badge>
            <Badge>{listing.status}</Badge>
          </div>

          <Separator />

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{listing.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Listed By</h3>
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-medium">{listing.owner?.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {listing.owner?.email}
                    </p>
                  </div>
                </div>
              </div>

              {listing.assignedBroker && (
                <div>
                  <h3 className="font-semibold mb-2">Assigned Broker</h3>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-primary">{listing.assignedBroker.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {listing.assignedBroker.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              {user?.id === listing.owner?._id ? (
                <div className="text-center p-8 text-muted-foreground">
                  This is your listing
                </div>
              ) : showMessageForm ? (
                <MessageForm
                  recipientId={listing.assignedBroker?._id || listing.owner?._id}
                  listingId={listing._id}
                  onSuccess={() => {
                    setShowMessageForm(false);
                    onOpenChange(false);
                  }}
                />
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Interested in this listing?
                  </p>
                  <Button onClick={() => setShowMessageForm(true)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
