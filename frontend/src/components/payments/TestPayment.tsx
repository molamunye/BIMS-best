// src/components/payments/TestPayment.tsx
// Ensure this file is created in the same directory as PaymentDialog.tsx (src/components/payments/).
// The export is a named export { TestPayment }, matching the import in PaymentDialog.tsx.

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TestPaymentProps {
  listingId: string;
  onPaymentSuccess: (data?: any) => void;
}

export function TestPayment({ listingId, onPaymentSuccess }: TestPaymentProps) {
  const handleTestPayment = () => {
    // Simulate a successful payment response
    const mockData = {
      listingId,
      paymentMethod: "test",
      amount: 100, // or dynamically based on type, but hardcoded for simplicity
      status: "success",
    };
    toast.success("Test payment completed successfully!");
    onPaymentSuccess(mockData);
  };

  return (
    <div className="p-4 text-center border rounded-md bg-gray-50">
      <p className="mb-4 text-sm text-muted-foreground">
        Test Mode: Simulating payment for Listing ID {listingId}
      </p>
      <Button onClick={handleTestPayment} className="w-full">
        Complete Test Payment
      </Button>
    </div>
  );
}