"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, AlertCircle, CheckCircle, CreditCard, Wallet, Building2 } from "lucide-react"
import { loadRazorpay, createOrder } from "../utils/razorpay"
import PaymentService from "@/app/services/paymentService"

export default function PayRentPage() {
  const searchParams = useSearchParams()
  const propertyIdFromUrl = searchParams.get('propertyId')
  
  const [paymentStep, setPaymentStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("razorpay")
  const [formData, setFormData] = useState({
    propertyId: propertyIdFromUrl || "1",
    month: new Date().toISOString().split("T")[0].slice(0, 7),
    amount: "85000",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    bankName: "",
    accountNumber: "",
  })
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [allProperties, setAllProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [razorpayLoading, setRazorpayLoading] = useState(false)
  const [razorpayError, setRazorpayError] = useState("")

  // Fetch property data when component mounts
  useEffect(() => {
    const fetchAllProperties = async () => {
      setLoading(true)
      setError("")
      try {
        // Fetch all properties from backend
        const response = await fetch("http://172.20.10.5:8080/api/properties")
        if (!response.ok) {
          throw new Error("Failed to fetch properties")
        }
        const properties = await response.json()
        setAllProperties(properties)
        
        // If a specific property ID is provided in URL, select it
        if (propertyIdFromUrl) {
          fetchPropertyById(propertyIdFromUrl)
        } else {
          // Set first property as default if available
          if (properties.length > 0) {
            const defaultProperty = properties[0]
            setSelectedProperty(defaultProperty)
            setFormData(prev => ({
              ...prev,
              propertyId: defaultProperty.id,
              amount: defaultProperty.rent?.toString() || "0"
            }))
          }
          setLoading(false)
        }
      } catch (err) {
        console.error("Error fetching properties:", err)
        setError("Failed to load properties")
        // Fallback to hardcoded properties
        const fallbackProperties = [
          { id: "1", name: "Bandra, Mumbai", rent: "85000" },
          { id: "2", name: "Indiranagar, Bangalore", rent: "45000" },
        ]
        setAllProperties(fallbackProperties)
        if (!propertyIdFromUrl) {
          const defaultProperty = fallbackProperties[0]
          setSelectedProperty(defaultProperty)
          setFormData(prev => ({
            ...prev,
            propertyId: defaultProperty.id,
            amount: defaultProperty.rent
          }))
        }
        setLoading(false)
      }
    }

    fetchAllProperties()
  }, [propertyIdFromUrl])

  const fetchPropertyById = async (id: string) => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`http://172.20.10.5:8080/api/properties/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch property")
      }
      const property = await response.json()
      setSelectedProperty(property)
      setFormData(prev => ({
        ...prev,
        propertyId: property.id,
        amount: property.rent?.toString() || "0"
      }))
    } catch (err) {
      setError("Failed to load property information")
      console.error("Error fetching property:", err)
      // Fallback to default property
      const defaultProperty = { id: id, name: `Property ${id}`, rent: "0" }
      setSelectedProperty(defaultProperty)
      setFormData(prev => ({
        ...prev,
        propertyId: defaultProperty.id,
        amount: defaultProperty.rent
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePropertySelect = (property: any) => {
    // Update form data with selected property
    setFormData(prev => ({
      ...prev,
      propertyId: property.id,
      amount: property.rent?.toString() || "0"
    }))
    
    // Update selected property state
    setSelectedProperty(property)
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentStep(3)
    
    // Load Razorpay SDK and create order
    try {
      setRazorpayLoading(true)
      setRazorpayError("")
      
      // Load Razorpay SDK
      const isRazorpayLoaded = await loadRazorpay()
      if (!isRazorpayLoaded) {
        throw new Error("Failed to load Razorpay SDK")
      }
      
      // Create order
      const orderData = await createOrder(parseInt(formData.amount), "INR")
      if (!orderData) {
        throw new Error("Failed to create payment order")
      }
      
      // Initialize Razorpay payment
      const options = {
        key: "rzp_test_RhZRyTKvEYbGBl", // Test key from application.properties
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HomeEase",
        description: `Rent Payment for ${selectedProperty?.title || selectedProperty?.name || 'Property'}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Payment successful - now create payment record in backend
          try {
            // Create processed payment in backend
            const paymentData = {
              propertyId: formData.propertyId,
              amount: parseInt(formData.amount),
              description: `Rent payment for ${selectedProperty?.title || selectedProperty?.name || 'Property'}`
            };
            
            await PaymentService.createProcessedPayment(paymentData, response.razorpay_payment_id);
            setPaymentStep(4)
          } catch (error) {
            console.error("Error creating payment:", error)
            setPaymentStep(1)
            setRazorpayError("Payment successful but failed to record in system. Please contact support.")
            setRazorpayLoading(false)
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "9876543210",
        },
        notes: {
          propertyId: formData.propertyId,
          month: formData.month,
        },
        theme: {
          color: "#3399cc",
        },
      }
      
      const rzp = new (window as any).Razorpay(options)
      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response)
        setPaymentStep(1)
        setRazorpayError(response.error.description || "Payment failed")
        setRazorpayLoading(false)
      })
      
      rzp.open()
    } catch (err: any) {
      console.error("Payment error:", err)
      setRazorpayError(err.message || "Failed to initiate payment")
      setPaymentStep(1)
      setRazorpayLoading(false)
    }
  }

  // If we're loading a specific property
  if (propertyIdFromUrl && loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-primary">
                HomeEase
              </Link>
              <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition">
                <ArrowLeft size={20} />
                Back Home
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                  <div className="w-12 h-12 bg-primary/20 rounded-full" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Loading Property Information</h3>
                <p className="text-muted-foreground">Please wait while we load your property details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If there's an error loading the property
  if (propertyIdFromUrl && error) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-primary">
                HomeEase
              </Link>
              <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition">
                <ArrowLeft size={20} />
                Back Home
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <AlertCircle size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Error Loading Property</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Link 
                href="/" 
                className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary">
              HomeEase
            </Link>
            <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition">
              <ArrowLeft size={20} />
              Back Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Pay Your Rent</h1>
          <p className="text-muted-foreground">Safe and secure payment for your rental property</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex-1 h-1 rounded-full transition ${step <= paymentStep ? "bg-primary" : "bg-border"}`}
              />
              {step < 4 && <div className="w-2" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {paymentStep === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setPaymentStep(2)
              }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {propertyIdFromUrl ? "Property Details" : "Select Property"}
                </h2>
              </div>

              {/* Display single property when propertyId is provided */}
              {propertyIdFromUrl ? (
                selectedProperty && (
                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                        formData.propertyId === selectedProperty.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name="propertyId"
                        value={selectedProperty.id}
                        checked={formData.propertyId === selectedProperty.id}
                        onChange={handleInputChange}
                        className="w-4 h-4 cursor-pointer"
                        disabled={!!propertyIdFromUrl}
                      />
                      <Building2 size={20} className="text-primary" />
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{selectedProperty.title || selectedProperty.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Rent: ₹{selectedProperty.rent?.toLocaleString() || selectedProperty.rent}/month
                        </div>
                        {selectedProperty.location && (
                          <div className="text-sm text-muted-foreground">{selectedProperty.location}</div>
                        )}
                      </div>
                    </label>
                  </div>
                )
              ) : (
                // Display property selection when no propertyId is provided
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Your Properties</label>
                  <div className="space-y-3">
                    {allProperties.map((property) => (
                      <label
                        key={property.id}
                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                          formData.propertyId === property.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                        onClick={() => handlePropertySelect(property)}
                      >
                        <input
                          type="radio"
                          name="propertyId"
                          value={property.id}
                          checked={formData.propertyId === property.id}
                          onChange={() => {}} // Prevent default behavior
                          className="w-4 h-4 cursor-pointer"
                        />
                        <Building2 size={20} className="text-primary" />
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{property.title || property.name}</div>
                          <div className="text-sm text-muted-foreground">Rent: ₹{property.rent?.toLocaleString() || property.rent}/month</div>
                          {property.location && (
                            <div className="text-sm text-muted-foreground">{property.location}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Payment Month</label>
                <input
                  type="month"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="bg-secondary p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">Amount to Pay:</span>
                  <span className="text-2xl font-bold text-primary">₹{formData.amount}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Continue to Payment
              </button>
            </form>
          )}

          {paymentStep === 2 && (
            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Select Payment Method</h2>
              </div>

              {/* Payment Method Selection - Only Razorpay for now */}
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                    paymentMethod === "razorpay" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <CreditCard size={20} className="text-primary" />
                  <span className="font-semibold text-foreground">Razorpay (Credit/Debit Card, UPI, Net Banking)</span>
                </label>
              </div>

              {razorpayError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  <AlertCircle size={18} className="inline mr-2" />
                  {razorpayError}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentStep(1)}
                  className="flex-1 py-3 border border-border rounded-lg text-foreground hover:bg-secondary transition font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={razorpayLoading}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50"
                >
                  {razorpayLoading ? "Processing..." : "Pay with Razorpay"}
                </button>
              </div>
            </form>
          )}

          {paymentStep === 3 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                  <div className="w-12 h-12 bg-primary/20 rounded-full" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Redirecting to Payment Gateway</h3>
                <p className="text-muted-foreground">Please wait while we redirect you to Razorpay...</p>
              </div>
            </div>
          )}

          {paymentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
                <p className="text-muted-foreground">Your rent payment has been processed successfully</p>
              </div>

              <div className="bg-secondary p-6 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-semibold text-foreground">TXN123456789</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-semibold text-foreground">₹{formData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Date:</span>
                  <span className="font-semibold text-foreground">{new Date().toLocaleDateString()}</span>
                </div>
                {selectedProperty && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property:</span>
                    <span className="font-semibold text-foreground">
                      {selectedProperty.title || selectedProperty.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 border border-border rounded-lg text-foreground hover:bg-secondary transition font-semibold"
                >
                  Print Receipt
                </button>
                <Link
                  href="/"
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-semibold text-center"
                >
                  Back to Home
                </Link>
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
  )
}