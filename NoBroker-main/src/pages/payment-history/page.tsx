"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, IndianRupee, Home, User, CheckCircle, XCircle, Clock } from "lucide-react"
import PaymentService from "@/app/services/paymentService"

interface Property {
  id: number;
  title: string;
  location: string;
}

interface Payment {
  id: number;
  property: Property;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  paymentDate: string;
  transactionId: string | null;
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = () => {
      const userData = localStorage.getItem("user")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }

    const fetchPaymentHistory = async () => {
      try {
        if (user) {
          // Fetch payments based on user role
          if (user.role === "RENTER") {
            const renterPayments = await PaymentService.getPaymentsByRenter(user.id)
            setPayments(renterPayments)
          } else if (user.role === "OWNER") {
            const ownerPayments = await PaymentService.getPaymentsByOwner(user.id)
            setPayments(ownerPayments)
          } else {
            // For admin or other roles, we might want to show all payments
            // But for now, let's just show an empty array
            setPayments([])
          }
        }
      } catch (error: any) {
        console.error("Error fetching payment history:", error)
        setError(error.message || "Failed to fetch payment history")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
    fetchPaymentHistory()
  }, [user])

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="text-green-600" size={20} />
      case "FAILED":
        return <XCircle className="text-red-600" size={20} />
      case "PENDING":
        return <Clock className="text-yellow-600" size={20} />
      default:
        return <Clock className="text-gray-600" size={20} />
    }
  }

  const getStatusText = (status: Payment['status']) => {
    switch (status) {
      case "COMPLETED":
        return "Completed"
      case "FAILED":
        return "Failed"
      case "PENDING":
        return "Pending"
      default:
        return status
    }
  }

  const getStatusClass = (status: Payment['status']) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-foreground hover:text-primary transition"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment History</h1>
          <p className="text-muted-foreground">View your payment transactions and history</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Recent Payments</h2>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-12">
                <IndianRupee className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-foreground">No payments found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You haven't made any payments yet.
                </p>
                <Link
                  href="/pay-rent"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
                >
                  Make a Payment
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-6 hover:bg-secondary/20 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <Home className="text-primary" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{payment.property.title}</h3>
                          <p className="text-sm text-muted-foreground">{payment.property.location}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar size={16} className="text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusClass(payment.status)}`}>
                            {getStatusText(payment.status)}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          ₹{payment.amount.toLocaleString()}
                        </div>
                        {payment.transactionId && (
                          <div className="text-xs text-muted-foreground">
                            Transaction: {payment.transactionId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}