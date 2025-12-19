import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ChapaInlineCheckoutProps {
  publicKey: string;
  txRef: string;
  amount: number;
  currency?: string;
  email: string;
  first_name: string;
  last_name: string;
  callbackUrl: string;
  onSuccess?: (data: any) => void;
  onClose?: () => void;
  onError?: (error: string) => void;
  buttonText?: string;
  containerId?: string;
}

declare global {
  interface Window {
    ChapaCheckout: any;
  }
}

export default function ChapaInlineCheckout({
  publicKey,
  txRef,
  amount,
  currency = "ETB",
  email,
  first_name,
  last_name,
  callbackUrl,
  onSuccess,
  onClose,
  onError,
  buttonText = "Pay Now",
  containerId = "chapa-inline-form",
}: ChapaInlineCheckoutProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chapaInstanceRef = useRef<any>(null);

  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    const loadChapaScript = async () => {
      try {
        // Check if script already loaded
        if (window.ChapaCheckout) {
          initializeChapa();
          return;
        }

        // Check if script tag already exists
        const existingScript = document.querySelector(
          'script[src="https://js.chapa.co/v1/inline.js"]'
        );
        if (existingScript) {
          existingScript.addEventListener("load", initializeChapa);
          return;
        }

        // Load Chapa script
        script = document.createElement("script");
        script.src = "https://js.chapa.co/v1/inline.js";
        script.async = true;
        script.onload = initializeChapa;
        script.onerror = () => {
          setError("Failed to load Chapa payment script");
          setLoading(false);
          onError?.("Failed to load Chapa payment script");
        };
        document.head.appendChild(script);
      } catch (err: any) {
        setError(err.message || "Failed to initialize payment");
        setLoading(false);
        onError?.(err.message || "Failed to initialize payment");
      }
    };

    const initializeChapa = () => {
      try {
        if (!window.ChapaCheckout) {
          throw new Error("ChapaCheckout not available");
        }

        if (!containerRef.current) {
          throw new Error("Container not found");
        }

        // Clear container
        containerRef.current.innerHTML = "";

        // Initialize Chapa
        const chapa = new window.ChapaCheckout({
          publicKey,
          amount: amount.toString(),
          currency,
          availablePaymentMethods: [
            "telebirr",
            "cbebirr",
            "ebirr",
            "mpesa",
            "chapa",
          ],
          customizations: {
            buttonText,
            styles: `
              .chapa-pay-button { 
                background-color: #4CAF50; 
                color: white;
                border-radius: 8px;
                padding: 12px 24px;
                font-weight: 600;
                width: 100%;
              }
              .chapa-pay-button:hover {
                background-color: #45a049;
              }
            `,
          },
          callbackUrl,
          showFlag: true,
          showPaymentMethodsNames: true,
          onSuccessfulPayment: (data: any) => {
            console.log("Payment successful:", data);
            toast.success("Payment completed successfully!");
            onSuccess?.(data);
          },
          onPaymentFailure: (error: any) => {
            console.error("Payment failed:", error);
            toast.error("Payment failed. Please try again.");
            onError?.(error?.message || "Payment failed");
          },
          onClose: () => {
            console.log("Payment popup closed");
            onClose?.();
          },
        });

        chapa.initialize(containerId);
        chapaInstanceRef.current = chapa;
        setLoading(false);
      } catch (err: any) {
        console.error("Chapa initialization error:", err);
        setError(err.message || "Failed to initialize payment");
        setLoading(false);
        onError?.(err.message || "Failed to initialize payment");
      }
    };

    loadChapaScript();

    // Cleanup
    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (chapaInstanceRef.current && containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [
    publicKey,
    txRef,
    amount,
    currency,
    email,
    first_name,
    last_name,
    callbackUrl,
    buttonText,
    containerId,
    onSuccess,
    onClose,
    onError,
  ]);

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">
            Loading payment form...
          </span>
        </div>
      )}
      <div
        ref={containerRef}
        id={containerId}
        className="w-full min-h-[200px]"
      />
    </div>
  );
}

