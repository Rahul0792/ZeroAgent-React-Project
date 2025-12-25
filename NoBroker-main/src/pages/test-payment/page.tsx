"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TestPaymentPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCreateOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          amount: "100",
          currency: "INR",
        }),
      });

      const data = await response.json();
      setResult({ endpoint: "create-order", status: response.status, data });
    } catch (error: any) {
      setResult({ endpoint: "create-order", error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testVerifyPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/razorpay/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          paymentId: "test_payment_id",
          orderId: "test_order_id",
          signature: "test_signature",
        }),
      });

      const data = await response.json();
      setResult({ endpoint: "verify-payment", status: response.status, data });
    } catch (error: any) {
      setResult({ endpoint: "verify-payment", error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-primary">HomeEase</div>
            <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition">
              <ArrowLeft size={20} />
              Back Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment API Test</h1>
          <p className="text-muted-foreground">Test the Razorpay integration endpoints</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Test Create Order</h2>
            <p className="text-muted-foreground mb-4">
              This will test the endpoint that creates a Razorpay order.
            </p>
            <button
              onClick={testCreateOrder}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Create Order"}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Test Verify Payment</h2>
            <p className="text-muted-foreground mb-4">
              This will test the endpoint that verifies a Razorpay payment.
            </p>
            <button
              onClick={testVerifyPayment}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Verify Payment"}
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Test Result</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}