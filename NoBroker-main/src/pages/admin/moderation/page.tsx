"use client"

import Link from "next/link"
import { ArrowLeft, Check, X, AlertCircle } from "lucide-react"
import AdminNavigation from "../components/AdminNavigation"
import { useEffect, useState } from "react"
import { adminPropertiesApi } from "@/app/admin/services/adminApi"
import { adminStatisticsApi } from "@/app/admin/services/adminApi"

interface FlaggedListing {
  id: number
  title: string
  reason: string
  priority: "high" | "medium" | "low"
  owner: string
  flagged?: boolean
}

interface PendingReview {
  id: number
  title: string
  owner: string
  date: string
}

interface ModerationStats {
  pendingReviews: number
  suspiciousListings: number
  verifiedThisMonth: number
}

export default function AdminModerationPage() {
  const [flaggedListings, setFlaggedListings] = useState<FlaggedListing[]>([])
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([])
  const [stats, setStats] = useState<ModerationStats>({
    pendingReviews: 0,
    suspiciousListings: 0,
    verifiedThisMonth: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending") // Add active tab state

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending properties
        const pendingResponse = await adminPropertiesApi.getPendingProperties()
        if (pendingResponse.success) {
          const pendingProperties = pendingResponse.properties || []
          
          // Get pending reviews (properties not yet approved)
          const pending = pendingProperties.map((property: any) => ({
            id: property.id,
            title: property.title,
            owner: property.ownerName || "Unknown Owner",
            date: property.createdAt ? new Date(property.createdAt).toISOString().split('T')[0] : "Unknown Date"
          }))
          setPendingReviews(pending)
        }
        
        // Fetch flagged properties
        const flaggedResponse = await adminPropertiesApi.getFlaggedProperties()
        if (flaggedResponse.success) {
          const flaggedProperties = flaggedResponse.properties || []
          const flagged = flaggedProperties.slice(0, 4).map((property: any, index: number) => ({
            id: property.id,
            title: property.title,
            reason: property.flagged ? "Flagged by admin" : 
                   index % 3 === 0 ? "Multiple complaints" : 
                   index % 3 === 1 ? "Image verification failed" : 
                   "Document pending",
            priority: property.flagged ? "high" : 
                     index % 3 === 0 ? "high" : 
                     index % 3 === 1 ? "high" : 
                     "medium",
            owner: property.ownerName || "Unknown Owner",
            flagged: property.flagged || false
          }))
          setFlaggedListings(flagged)
        }
        
        // Fetch statistics
        const statsResponse = await adminStatisticsApi.getDashboardStatistics()
        if (statsResponse.success) {
          const statistics = statsResponse.statistics || {}
          setStats({
            pendingReviews: statistics.pendingProperties || 0,
            suspiciousListings: flaggedListings.length,
            verifiedThisMonth: 156 // This would need a specific endpoint in a real app
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleApproveProperty = async (id: number) => {
    try {
      const response = await adminPropertiesApi.approveProperty(id)
      if (response.success) {
        // Update the UI to reflect the change
        setPendingReviews(prev => prev.filter(item => item.id !== id))
        // Refresh stats
        const statsResponse = await adminStatisticsApi.getDashboardStatistics()
        if (statsResponse.success) {
          const statistics = statsResponse.statistics || {}
          setStats(prev => ({
            ...prev,
            pendingReviews: statistics.pendingProperties || 0
          }))
        }
      } else {
        console.error("Failed to approve property:", response.message)
      }
    } catch (error) {
      console.error("Error approving property:", error)
    }
  }

  const handleRejectProperty = async (id: number) => {
    try {
      const response = await adminPropertiesApi.rejectProperty(id)
      if (response.success) {
        // Update the UI to reflect the change
        setPendingReviews(prev => prev.filter(item => item.id !== id))
        // Refresh stats
        const statsResponse = await adminStatisticsApi.getDashboardStatistics()
        if (statsResponse.success) {
          const statistics = statsResponse.statistics || {}
          setStats(prev => ({
            ...prev,
            pendingReviews: statistics.pendingProperties || 0
          }))
        }
      } else {
        console.error("Failed to reject property:", response.message)
      }
    } catch (error) {
      console.error("Error rejecting property:", error)
    }
  }

  const handleFlagProperty = async (id: number) => {
    try {
      const response = await adminPropertiesApi.flagProperty(id)
      if (response.success) {
        // Update the UI to reflect the change
        setFlaggedListings(prev => prev.map(item => 
          item.id === id ? {...item, flagged: true} : item
        ))
      } else {
        console.error("Failed to flag property:", response.message)
      }
    } catch (error) {
      console.error("Error flagging property:", error)
    }
  }

  const handleUnflagProperty = async (id: number) => {
    try {
      const response = await adminPropertiesApi.unflagProperty(id)
      if (response.success) {
        // Update the UI to reflect the change
        setFlaggedListings(prev => prev.map(item => 
          item.id === id ? {...item, flagged: false} : item
        ))
      } else {
        console.error("Failed to unflag property:", response.message)
      }
    } catch (error) {
      console.error("Error unflagging property:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading moderation data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <AdminNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin" className="flex items-center gap-2 text-foreground hover:text-primary transition">
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Content Moderation</h1>
          <p className="text-muted-foreground">Review and manage flagged content and pending approvals</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border mb-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-3 font-semibold transition ${
              activeTab === "pending"
                ? "text-primary border-b-2 border-primary -mb-[2px]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending Reviews ({pendingReviews.length})
          </button>
          <button
            onClick={() => setActiveTab("flagged")}
            className={`px-4 py-3 font-semibold transition ${
              activeTab === "flagged"
                ? "text-primary border-b-2 border-primary -mb-[2px]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Flagged Content ({flaggedListings.length})
          </button>
        </div>

        {/* Pending Reviews Tab */}
        {activeTab === "pending" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">Pending Reviews</h2>
              <p className="text-muted-foreground text-sm mt-1">New listings awaiting approval</p>
            </div>

            <div className="divide-y divide-border">
              {pendingReviews.length > 0 ? (
                pendingReviews.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-secondary/20 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">Owner: {item.owner}</p>
                        <p className="text-xs text-muted-foreground mt-1">Submitted: {item.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApproveProperty(item.id)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleRejectProperty(item.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Check className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-2 text-sm font-semibold text-foreground">No pending reviews</h3>
                  <p className="mt-1 text-sm text-muted-foreground">All properties have been reviewed.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Flagged Content Tab */}
        {activeTab === "flagged" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">Flagged Listings</h2>
              <p className="text-muted-foreground text-sm mt-1">Content reported by users or flagged by system</p>
            </div>

            <div className="divide-y divide-border">
              {flaggedListings.length > 0 ? (
                flaggedListings.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-secondary/20 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">Owner: {item.owner}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          item.priority === "high"
                            ? "bg-destructive/10 text-destructive"
                            : item.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                      </span>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold flex items-center gap-2">
                        <Check size={16} />
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-destructive text-white rounded-lg hover:opacity-90 transition text-sm font-semibold flex items-center gap-2">
                        <X size={16} />
                        Reject
                      </button>
                      {item.flagged ? (
                        <button 
                          onClick={() => handleUnflagProperty(item.id)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-semibold"
                        >
                          Unflag
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleFlagProperty(item.id)}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-semibold"
                        >
                          Flag
                        </button>
                      )}
                      <button className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition text-sm font-semibold">
                        Review Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-foreground">No flagged listings</h3>
                  <p className="mt-1 text-sm text-muted-foreground">No listings have been flagged for review.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Moderation Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Moderation Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="text-3xl font-bold text-destructive mb-2">{stats.pendingReviews}</div>
              <p className="text-muted-foreground">Pending Reviews</p>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.suspiciousListings}</div>
              <p className="text-muted-foreground">Suspicious Listings</p>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.verifiedThisMonth}</div>
              <p className="text-muted-foreground">Verified This Month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}