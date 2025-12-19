import { useState, useEffect } from "react";
import { formatETB, cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, MapPin, Trash2, MessageSquare, Handshake } from "lucide-react";
import { toast } from "sonner";
import ListingForm from "./ListingForm";
import MessageForm from "./MessageForm";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useAuth } from "@/hooks/useAuth";
import PaymentDialog from "@/components/payments/PaymentDialog";
import { api } from "@/lib/api";

interface ListingCardProps {
  listing: any;
  canEdit?: boolean;
  canSell?: boolean;
  onDeleted: (id: string) => void;
  onUpdated: () => void;
}

export default function ListingCard({ listing, canEdit, canSell, onDeleted, onUpdated }: ListingCardProps) {
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [buyerId, setBuyerId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [selling, setSelling] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [contactPaid, setContactPaid] = useState<boolean | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    setDeleting(true);
    try {
      await api.delete(`/listings/${listing._id}`);
      toast.success("Listing deleted");
      onDeleted(listing._id);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete listing");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdated = () => {
    setEditOpen(false);
    onUpdated();
    toast.success("Listing updated");
  };

  const handleSell = async () => {
    if (!buyerId) {
      toast.error("Please enter the Buyer ID.");
      return;
    }
    setSelling(true);
    try {
      const response = await api.post(`/listings/${listing._id}/sell`, { buyerId });

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to mark as sold.');
      }

      toast.success(response.data.message || "Listing marked as sold!");
      setSellOpen(false);
      onUpdated();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setSelling(false);
    }
  };

  // Handle contact owner with payment check
  const handleContact = async () => {


    setCheckingPayment(true);
    try {
      // Check if payment already made
      const response = await api.get(`/contact/${listing._id}/status`);
      if (response.data.paid) {
        setContactPaid(true);
        setMessageOpen(true);
      } else {
        // Show payment dialog
        setShowPaymentDialog(true);
      }
    } catch (error: any) {
      console.error("Error checking payment status:", error);
      // If endpoint doesn't exist or error, show payment dialog anyway
      setShowPaymentDialog(true);
    } finally {
      setCheckingPayment(false);
    }
  };

  const formatPrice = (price: number) => formatETB(price);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <div className="aspect-video w-full overflow-hidden relative bg-muted">
        <ImageWithFallback
          src={listing.images?.[0] || "/placeholder.svg"}
          alt={listing.title}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant="secondary" className="capitalize bg-white/90 hover:bg-white/90 text-black shadow-sm">
            {listing.type}
          </Badge>
          <Badge
            variant={listing.status === "active" ? "default" : "outline"}
            className="capitalize shadow-sm"
          >
            {listing.status}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-lg line-clamp-2 break-words">{listing.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 pb-3 flex-grow">
        <p className="text-2xl font-bold text-primary">{formatPrice(listing.price)}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          {listing.location}
        </div>
        <div className="relative">
          <p className={cn(
            "text-sm text-muted-foreground break-words whitespace-pre-wrap",
            !isExpanded && "line-clamp-4"
          )}>
            {listing.description}
          </p>
          {listing.description && listing.description.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-medium text-primary hover:underline mt-1 focus:outline-none"
            >
              {isExpanded ? "Show Less" : "Read More"}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-2">
          {listing.owner?.fullName && (
            <div className="flex justify-between">
              <span>Created by:</span>
              <span className="font-medium text-foreground">{listing.owner.fullName}</span>
            </div>
          )}
          {listing.assignedBroker?.fullName && (
            <div className="flex justify-between">
              <span>Assigned to:</span>
              <span className="font-medium text-foreground">{listing.assignedBroker.fullName}</span>
            </div>
          )}
          {listing.verifiedBy?.fullName && (
            <div className="flex justify-between">
              <span>Verified by:</span>
              <span className="font-medium text-green-600">{listing.verifiedBy.fullName}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        {canEdit && user?.role !== 'broker' && (
          <>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Listing</DialogTitle>
                  <DialogDescription>Update the details and images of your property or vehicle listing.</DialogDescription>
                </DialogHeader>
                <ListingForm listing={listing} onSuccess={handleUpdated} />
              </DialogContent>
            </Dialog>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
        {!canEdit && !canSell && (
          listing.verificationStatus === "approved" ? (
            <>
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={handleContact}
                disabled={checkingPayment}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {checkingPayment ? "Checking..." : "Contact Owner"}
              </Button>

              <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Message</DialogTitle>
                    <DialogDescription>Send a message to the owner or assigned broker of this listing.</DialogDescription>
                  </DialogHeader>
                  <MessageForm
                    recipientId={listing.owner?._id || listing.owner || listing.assignedBroker?._id}
                    listingId={listing._id}
                    onSuccess={() => {
                      setMessageOpen(false);
                      toast.success("Message sent");
                    }}
                  />
                </DialogContent>
              </Dialog>

              <PaymentDialog
                open={showPaymentDialog}
                onOpenChange={setShowPaymentDialog}
                type="contact"
                listingId={listing._id}
                onSuccess={() => {
                  setContactPaid(true);
                  setShowPaymentDialog(false);
                  setMessageOpen(true);
                  toast.success("Payment completed! You can now contact the owner.");
                }}
                amount={50}
              />
            </>
          ) : (
            <div className="w-full text-center">
              <Badge variant="outline" className="w-full justify-center py-2 text-muted-foreground border-dashed">
                Contact disabled (awaiting approval)
              </Badge>
            </div>
          )
        )}
      </CardFooter>
    </Card>
  );
}
