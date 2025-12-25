"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Calendar, 
  IndianRupee, 
  Home, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw,
  Search,
  Filter
} from "lucide-react"
import PaymentService from "@/app/services/paymentService"

interface Property {
  id: number;
  title: string;
  location: string;
}

interface Payment {
  id: number;
  property: Property;
  renter: {
    id: number;
    name: string;
    email: string;
  };
  owner: {
    id: number;
    name: string;
    email: string;
  };
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentDate: string;
  transactionId: string | null;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = () => {
      const userData = localStorage.getItem("user")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }

    const fetchPaymentData = async () => {
      try {
        const paymentData = await PaymentService.getAllPayments()
        setPayments(paymentData)
        setFilteredPayments(paymentData)
      } catch (error: any) {
        console.error("Error fetching payment data:", error)
        setError(error.message || "Failed to fetch payment data")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
    fetchPaymentData()
    
    // Set up interval to refresh payments every 5 seconds
    const intervalId = setInterval(fetchPaymentData, 5000)
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    // Filter payments based on search term and status
    let result = payments
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(payment => 
        payment.property.title.toLowerCase().includes(term) ||
        payment.renter.name.toLowerCase().includes(term) ||
        payment.owner.name.toLowerCase().includes(term) ||
        (payment.transactionId && payment.transactionId.toLowerCase().includes(term))
      )
    }
    
    // Apply status filter
    if (statusFilter !== "ALL") {
      result = result.filter(payment => payment.status === statusFilter)
    }
    
    setFilteredPayments(result)
  }, [searchTerm, statusFilter, payments])

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="text-green-600" size={20} />
      case "FAILED":
        return <XCircle className="text-red-600" size={20} />
      case "PENDING":
        return <Clock className="text-yellow-600" size={20} />
      case "REFUNDED":
        return <RotateCcw className="text-blue-600" size={20} />
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
      case "REFUNDED":
        return "Refunded"
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
      case "REFUNDED":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleRefund = async (paymentId: number) => {
    try {
      await PaymentService.refundPayment(paymentId)
      // Refresh the payment data
      const updatedPayments = await PaymentService.getAllPayments()
      setPayments(updatedPayments)
      setFilteredPayments(updatedPayments)
      alert(`Payment ID: ${paymentId} has been refunded successfully`)
    } catch (error: any) {
      console.error("Error refunding payment:", error)
      alert(`Failed to refund payment: ${error.message || "Unknown error"}`)
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
            <Link href="/admin" className="text-2xl font-bold text-primary">
              HomeEase Admin
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 text-foreground hover:text-primary transition"
            >
              <ArrowLeft size={20} />
              Back to Admin
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Management</h1>
          <p className="text-muted-foreground">Manage all payment transactions in the system</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search by property, renter, owner, or transaction ID..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <select
              className="pl-10 pr-8 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-primary">
              {payments.filter(p => p.status === 'COMPLETED').length}
            </div>
            <div className="text-muted-foreground">Completed</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">
              {payments.filter(p => p.status === 'PENDING').length}
            </div>
            <div className="text-muted-foreground">Pending</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">
              {payments.filter(p => p.status === 'FAILED').length}
            </div>
            <div className="text-muted-foreground">Failed</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">
              {payments.filter(p => p.status === 'REFUNDED').length}
            </div>
            <div className="text-muted-foreground">Refunded</div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Property
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Renter
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Owner
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                      Loading payments...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Home className="text-muted-foreground mr-2" size={16} />
                          <div>
                            <div className="font-medium text-foreground">{payment.property.title}</div>
                            <div className="text-sm text-muted-foreground">{payment.property.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="text-muted-foreground mr-2" size={16} />
                          <div>
                            <div className="font-medium text-foreground">{payment.renter.name}</div>
                            <div className="text-sm text-muted-foreground">{payment.renter.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="text-muted-foreground mr-2" size={16} />
                          <div>
                            <div className="font-medium text-foreground">{payment.owner.name}</div>
                            <div className="text-sm text-muted-foreground">{payment.owner.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <IndianRupee className="text-muted-foreground mr-1" size={16} />
                          <span className="font-medium text-foreground">{payment.amount.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1">{getStatusText(payment.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="text-muted-foreground mr-2" size={16} />
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {payment.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleRefund(payment.id)}
                            className="text-primary hover:text-primary/80 flex items-center"
                          >
                            <RotateCcw className="mr-1" size={16} />
                            Refund
                          </button>
                        )}
                        {(payment.status === 'PENDING' || payment.status === 'FAILED') && (
                          <span className="text-muted-foreground">-</span>
                        )}
                        {payment.status === 'REFUNDED' && (
                          <span className="text-muted-foreground">Refunded</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}