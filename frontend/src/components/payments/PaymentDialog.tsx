// src/components/payments/PaymentDialog.tsx
// The import will now resolve correctly once TestPayment.tsx is created in the same directory.
// Here's the full code for reference (no changes needed beyond the import resolving).

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ChapaInlineCheckout from "./ChapaInlineCheckout";
import { TestPayment } from "./TestPayment"; // Import TestPayment
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "listing" | "contact";
  listingId?: string;
  listingData?: any; // For listing creation
  onSuccess: (data?: any) => void;
  amount?: number;
}

export default function PaymentDialog({
  open,
  onOpenChange,
  type,
  listingId,
  listingData,
  onSuccess,
  amount,
}: PaymentDialogProps) {
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<"chapa" | "test">("chapa");

  useEffect(() => {
    if (open && !paymentData) {
      preparePayment();
    }
    // Reset payment data when dialog closes
    if (!open) {
      setPaymentData(null);
      setError(null);
      setPaymentMode("chapa");
    }
  }, [open, type, listingId, listingData]);

  const preparePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        type === "listing"
          ? "/payments/prepare-listing"
          : "/payments/prepare-contact";

      let payload: any = {};
      if (type === "contact") {
        payload = { listingId };
      } else if (listingId) {
        payload = { listingId };
      } else if (type === "listing" && listingData) {
        // For listing creation, pass listing data to create draft listing
        payload = { listingData };
      }

      const response = await api.post(endpoint, payload);
      setPaymentData(response.data);
    } catch (err: any) {
      console.error("Payment preparation error:", err);
      setError(
        err.response?.data?.message || "Failed to prepare payment. Please try again."
      );
      toast.error("Failed to prepare payment");
    }
    finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    toast.success("Payment completed successfully!");
    onSuccess(data);
    onOpenChange(false);
    // Reset payment data for next time
    setPaymentData(null);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    toast.error("Payment failed. Please try again.");
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after a delay to allow dialog to close
    setTimeout(() => {
      setPaymentData(null);
      setError(null);
    }, 300);
  };

  const displayAmount = amount || paymentData?.amount || (type === "listing" ? 100 : 50);

  // The listing ID is needed for the test payment.
  // It's in paymentData.listingId for new listings, or the listingId prop for existing ones.
  const finalListingId = paymentData?.listingId || listingId;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "listing" ? "Pay Listing Fee" : "Pay Contact Fee"}
          </DialogTitle>
          <DialogDescription>
            {type === "listing"
              ? "Please complete the payment to create your listing."
              : "Please complete the payment to contact the owner."}
            <br />
            <span className="font-semibold text-lg mt-2 block">
              Amount: {displayAmount} ETB
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Preparing payment...
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-600 bg-red-50 rounded-md">
              <p>{error}</p>
              <button
                onClick={preparePayment}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {paymentData && !loading && !error && (
            <div>
              <div className="flex justify-center space-x-2 mb-4">
                <Button variant={paymentMode === 'chapa' ? 'default' : 'outline'} onClick={() => setPaymentMode('chapa')}>Live Payment</Button>
                <Button variant={paymentMode === 'test' ? 'default' : 'outline'} onClick={() => setPaymentMode('test')}>Test Mode</Button>
              </div>

              {paymentMode === 'chapa' && (
                <ChapaInlineCheckout
                  publicKey={import.meta.env.VITE_CHAPA_PUBLIC_KEY}
                  txRef={paymentData.tx_ref}
                  amount={paymentData.amount}
                  currency={paymentData.currency}
                  email={paymentData.email}
                  first_name={paymentData.first_name}
                  last_name={paymentData.last_name}
                  callbackUrl={paymentData.callbackUrl}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onClose={handleClose}
                  buttonText="Pay Now"
                  containerId={`chapa-${type}-${Date.now()}`}
                />
              )}

              {paymentMode === 'test' && finalListingId && (
                <TestPayment
                  listingId={finalListingId}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              )}
              {paymentMode === 'test' && !finalListingId && (
                <div className="text-center text-muted-foreground">
                  Could not identify listing for test payment.
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}