import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, FileText, ExternalLink, MapPin, Image as ImageIcon } from "lucide-react";
import api from "@/lib/api";
import { formatETB } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Listing {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  location: string;
  verification_status: string;
  verification_notes: string | null;
  created_at: string;
  images: string[];
  license_document_url?: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function BrokerVerificationTasks() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadAssignedListings();
    }
  }, [user]);

  const loadAssignedListings = async () => {
    setLoading(true);
    try {
      // Fetch: verificationStatus=assigned AND assignedBroker=me
      const endpoint = `/listings?verificationStatus=assigned&assignedBroker=${user?.id}`;

      const response = await api.get(endpoint);
      const data = response.data;

      // Map backend to frontend interface
      const mappedListings = (data || []).map((l: any) => {
        // Defensive: Handle metadata if it comes as string
        let meta = l.metadata;
        if (typeof meta === 'string') {
          try {
            meta = JSON.parse(meta);
          } catch (e) {
            console.error('Failed to parse metadata JSON', e);
          }
        }

        return {
          id: l._id || l.id,
          title: l.title,
          description: l.description,
          type: l.type,
          price: l.price,
          location: l.location,
          verification_status: l.verificationStatus,
          verification_notes: l.verificationNotes,
          created_at: l.createdAt,
          images: l.images || [],
          // Check metadata for license document.
          license_document_url: meta?.license_document,
          profiles: {
            full_name: l.owner?.fullName || 'Unknown',
            email: l.owner?.email || ''
          }
        };
      });

      setListings(mappedListings);
    } catch (error) {
      console.error("Failed to load tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (listing: Listing, status: "approved" | "rejected") => {
    if (status === "rejected" && !notes.trim()) {
      toast.error("Please provide feedback for rejection");
      return;
    }

    setSubmitting(true);
    // API: PUT /api/listings/:id/verify
    try {
      const response = await api.put(`/listings/${listing.id}/verify`, {
        status,
        notes: notes.trim()
      });

      if (response.status !== 200) throw new Error("Failed to verify");

      // After successful verification, also save a verification note to the sidebar list
      try {
        const noteRes = await api.post('/verification-notes', { listingId: listing.id, listingTitle: listing.title, note: notes.trim() || `${status}` });
        if (noteRes.status === 201 || noteRes.status === 200) {
          // notify other components (sidebar) to reload
          window.dispatchEvent(new CustomEvent('verificationNotesUpdated'));
        }
      } catch (e) {
        console.error('Failed to save verification note', e);
      }

      toast.success(`Listing ${status === "approved" ? "approved" : "rejected"} successfully`);
      setNotes("");
      setSelectedListing(null);
      loadAssignedListings();
    } catch (error) {
      toast.error("Failed to update listing");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Verification Tasks</h2>
        <p className="text-muted-foreground">
          {listings.length} listing{listings.length !== 1 ? 's' : ''} assigned for verification
        </p>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No listings assigned to you for verification
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{listing.title}</CardTitle>
                    <CardDescription>
                      Submitted by {listing.profiles?.full_name} on {new Date(listing.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {listing.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="font-semibold flex items-center gap-1">
                      {formatETB(listing.price)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {listing.location}
                    </span>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      onClick={() => setSelectedListing(listing)}
                    >
                      Review & Verify
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Verify Listing</DialogTitle>
                      <DialogDescription>
                        Review the listing details and documents below
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-4 -mr-4">
                      <div className="space-y-6 pb-6 pr-4">
                        {/* Listing Details */}
                        <div className="space-y-4">
                          {listing.images && listing.images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {listing.images.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt={`Listing ${i + 1}`}
                                  className="h-32 w-auto rounded-md object-cover border"
                                />
                              ))}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                            <div>
                              <label className="text-xs text-muted-foreground font-semibold uppercase">Title</label>
                              <p className="font-medium">{listing.title}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground font-semibold uppercase">Type</label>
                              <p className="capitalize">{listing.type}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground font-semibold uppercase">Price</label>
                              <p className="font-medium">{formatETB(listing.price)}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground font-semibold uppercase">Location</label>
                              <p>{listing.location}</p>
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs text-muted-foreground font-semibold uppercase">Description</label>
                              <p className="text-sm mt-1">{listing.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Documents Section */}
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Documents
                          </h4>
                          {listing.license_document_url ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 text-blue-600 rounded">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-medium">License Document</p>
                                    <p className="text-xs text-muted-foreground">PDF Document</p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                  <a href={listing.license_document_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                    Open in New Tab
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </Button>
                              </div>

                              {/* Embedded Preview */}
                              <div className="border rounded-lg overflow-hidden bg-muted/20">
                                <div className="p-2 bg-muted/40 border-b text-xs font-medium text-muted-foreground flex items-center gap-2">
                                  <FileText className="w-3 h-3" />
                                  Document Preview
                                </div>
                                <iframe
                                  src={listing.license_document_url}
                                  className="w-full h-[400px]"
                                  title="License Document Preview"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
                              No license document uploaded for this listing.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Verification Form - Fixed Footer */}
                    <div className="space-y-4 pt-4 border-t mt-2">
                      <h4 className="font-semibold text-sm">Verification Decision</h4>
                      <div className="space-y-2">
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Verification notes (required for rejection)..."
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          className="flex-1"
                          variant="default"
                          onClick={() => handleVerification(listing, "approved")}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          className="flex-1"
                          variant="destructive"
                          onClick={() => handleVerification(listing, "rejected")}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
