"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { loadRazorpay, createOrder, verifyPayment } from "../utils/razorpay";
import PaymentService from "@/app/services/paymentService";

export default function RazorpayPaymentPage() {
  const router = useRouter();
  const [paymentData, setPaymentData] = useState({
    amount: 100, // ₹1 in INR (100 paise)
    currency: "INR",
  });
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // 'idle' | 'processing' | 'success' | 'failed'
  const [errorMessage, setErrorMessage] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay SDK
    const loadScript = async () => {
      const loaded = await loadRazorpay();
      setRazorpayLoaded(loaded);
      if (!loaded) {
        setErrorMessage("Failed to load payment gateway. Please try again later.");
        setPaymentStatus("failed");
      }
    };

    loadScript();
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      setErrorMessage("Payment gateway is not loaded. Please try again later.");
      setPaymentStatus("failed");
      return;
    }

    setLoading(true);
    setPaymentStatus("processing");
    setErrorMessage("");

    try {
      // Step 1: Create order on backend
      const orderData = await createOrder(paymentData.amount, paymentData.currency);
      
      if (!orderData) {
        throw new Error("Failed to create payment order");
      }

      console.log("Order created:", orderData);

      // Step 2: Initialize Razorpay payment
      const options = {
        key: "rzp_test_RhZRyTKvEYbGBl", // Replace with your Razorpay key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HomeEase",
        description: "Rent Payment",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          console.log("Payment response:", response);
          
          // Step 3: Verify payment on backend
          try {
            const verifyData = await verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );

            if (!verifyData) {
              throw new Error("Failed to verify payment");
            }

            console.log("Verification response:", verifyData);

            if (verifyData.verified) {
              // Create processed payment in backend after successful verification
              try {
                const paymentInfo = {
                  propertyId: 1, // Default property ID for this test page
                  amount: paymentData.amount / 100, // Convert from paise to rupees
                  description: "Rent Payment"
                };
                
                await PaymentService.createProcessedPayment(paymentInfo, response.razorpay_payment_id);
                setPaymentStatus("success");
              } catch (paymentError) {
                console.error("Error creating payment:", paymentError);
                setPaymentStatus("failed");
                setErrorMessage("Payment successful but failed to record in system. Please contact support.");
              }
            } else {
              setPaymentStatus("failed");
              setErrorMessage(verifyData.message || "Payment verification failed");
            }
          } catch (error: any) {
            console.error("Verification error:", error);
            setPaymentStatus("failed");
            setErrorMessage(error.message || "Failed to verify payment");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: "John Doe",
          email: "john@example.com",
          contact: "9876543210",
        },
        notes: {
          address: "HomeEase Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp: any = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        console.log("Payment failed:", response);
        setPaymentStatus("failed");
        setErrorMessage(response.error.description || "Payment failed");
        setLoading(false);
      });

      rzp.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentStatus("failed");
      setErrorMessage(error.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-primary">HomeEase</div>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-foreground hover:text-primary transition"
            >
              <ArrowLeft size={20} />
              Back Home
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Pay Your Rent</h1>
          <p className="text-muted-foreground">Secure payment with Razorpay</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {paymentStatus === "idle" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Payment Details</h2>
              
              <div className="bg-secondary p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">Amount to Pay:</span>
                  <span className="text-2xl font-bold text-primary">₹{paymentData.amount / 100}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || !razorpayLoaded}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Processing..." : "Pay with Razorpay"}
              </button>
            </div>
          )}

          {paymentStatus === "processing" && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                  <div className="w-12 h-12 bg-primary/20 rounded-full" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Processing Payment</h3>
                <p className="text-muted-foreground">Please wait while we process your payment...</p>
              </div>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
                <p className="text-muted-foreground">Your rent payment has been processed successfully</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-semibold"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Payment Failed!</h2>
                <p className="text-muted-foreground">{errorMessage || "Your payment could not be processed"}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setPaymentStatus("idle");
                    setErrorMessage("");
                  }}
                  className="flex-1 py-3 border border-border rounded-lg text-foreground hover:bg-secondary transition font-semibold"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-semibold"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
          <div className="flex gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <strong>Security:</strong> All payments are encrypted and secured with bank-grade encryption. Your payment
              information is never stored on our servers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}