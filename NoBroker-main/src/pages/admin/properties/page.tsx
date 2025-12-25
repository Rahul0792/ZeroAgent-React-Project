"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Eye, Check, X, AlertCircle, Home } from "lucide-react"
import { adminPropertiesApi } from "../services/adminApi"

export default function AdminPropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [properties, setProperties] = useState<any[]>([])
  const [filteredProperties, setFilteredProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  // Fetch properties when component mounts
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const response = await adminPropertiesApi.getAllProperties()
        if (response.success) {
          setProperties(response.properties)
          setFilteredProperties(response.properties)
        } else {
          setError(response.message || "Failed to fetch properties")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch properties")
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // Filter properties when search term changes
  useEffect(() => {
    const filtered = properties.filter(
      (property) =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (property.ownerName && property.ownerName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    
    // Apply sorting if configured
    if (sortConfig !== null) {
      const sorted = [...filtered].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
      setFilteredProperties(sorted)
    } else {
      setFilteredProperties(filtered)
    }
  }, [searchTerm, properties, sortConfig])

  const handleApproveProperty = async (id: number) => {
    try {
      const response = await adminPropertiesApi.approveProperty(id)
      if (response.success) {
        // Update the property status in the local state
        setProperties(properties.map(prop => 
          prop.id === id ? { ...prop, approved: true } : prop
        ))
        setFilteredProperties(filteredProperties.map(prop => 
          prop.id === id ? { ...prop, approved: true } : prop
        ))
      } else {
        setError(response.message || "Failed to approve property")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve property")
    }
  }

  const handleRejectProperty = async (id: number) => {
    try {
      const response = await adminPropertiesApi.rejectProperty(id)
      if (response.success) {
        // Update the property status in the local state
        setProperties(properties.map(prop => 
          prop.id === id ? { ...prop, approved: false } : prop
        ))
        setFilteredProperties(filteredProperties.map(prop => 
          prop.id === id ? { ...prop, approved: false } : prop
        ))
      } else {
        setError(response.message || "Failed to reject property")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject property")
    }
  }

  const handleFlagProperty = async (id: number) => {
    try {
      const response = await adminPropertiesApi.flagProperty(id)
      if (response.success) {
        // Update the property status in the local state
        setProperties(properties.map(prop => 
          prop.id === id ? { ...prop, flagged: true } : prop
        ))
        setFilteredProperties(filteredProperties.map(prop => 
          prop.id === id ? { ...prop, flagged: true } : prop
        ))
      } else {
        setError(response.message || "Failed to flag property")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to flag property")
    }
  }

  const handleUnflagProperty = async (id: number) => {
    try {
      const response = await adminPropertiesApi.unflagProperty(id)
      if (response.success) {
        // Update the property status in the local state
        setProperties(properties.map(prop => 
          prop.id === id ? { ...prop, flagged: false } : prop
        ))
        setFilteredProperties(filteredProperties.map(prop => 
          prop.id === id ? { ...prop, flagged: false } : prop
        ))
      } else {
        setError(response.message || "Failed to unflag property")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unflag property")
    }
  }

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnName: string) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return <span className="ml-1">↕️</span>
    }
    return sortConfig.direction === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-foreground">Loading properties...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive text-xl font-semibold">Error</div>
          <p className="mt-2 text-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin" className="flex items-center gap-2 text-foreground hover:text-primary transition">
              <ArrowLeft size={20} />
              Back to Admin
            </Link>
            <Link href="/" className="text-2xl font-bold text-primary">
              HomeEase Admin
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Property Management</h1>
          <p className="text-muted-foreground">Manage and moderate property listings</p>
        </div>

        {/* Search and Stats */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search by title, location, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-border px-4 py-2">
              <span className="text-sm text-muted-foreground">Total: </span>
              <span className="font-semibold">{properties.length}</span>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-border px-4 py-2">
              <span className="text-sm text-muted-foreground">Approved: </span>
              <span className="font-semibold text-green-600">
                {properties.filter(p => p.approved).length}
              </span>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-border px-4 py-2">
              <span className="text-sm text-muted-foreground">Pending: </span>
              <span className="font-semibold text-yellow-600">
                {properties.filter(p => !p.approved).length}
              </span>
            </div>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-secondary/80 transition"
                    onClick={() => requestSort('title')}
                  >
                    <div className="flex items-center">
                      Title
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-secondary/80 transition"
                    onClick={() => requestSort('location')}
                  >
                    <div className="flex items-center">
                      Location
                      {getSortIcon('location')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-secondary/80 transition"
                    onClick={() => requestSort('ownerName')}
                  >
                    <div className="flex items-center">
                      Owner
                      {getSortIcon('ownerName')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-secondary/80 transition"
                    onClick={() => requestSort('rent')}
                  >
                    <div className="flex items-center">
                      Price
                      {getSortIcon('rent')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-secondary/80 transition"
                    onClick={() => requestSort('approved')}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon('approved')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-secondary/30 transition">
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                            {property.imageUrls && property.imageUrls.length > 0 ? (
                              <img
                                src={property.imageUrls[0]}
                                alt={property.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Home size={16} className="text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span>{property.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{property.location}</td>
                      <td className="px-6 py-4 text-muted-foreground">{property.ownerName}</td>
                      <td className="px-6 py-4 text-foreground">₹{property.rent?.toLocaleString()}/month</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                              property.approved
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {property.approved ? (
                              <>
                                <Check size={12} />
                                Approved
                              </>
                            ) : (
                              <>
                                <AlertCircle size={12} />
                                Pending
                              </>
                            )}
                          </span>
                          {property.flagged && (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-800 inline-flex items-center gap-1">
                              <AlertCircle size={12} />
                              Flagged
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button 
                              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                              title="View Property"
                            >
                              <Eye size={18} />
                            </button>
                            {!property.approved ? (
                              <button 
                                onClick={() => handleApproveProperty(property.id)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                                title="Approve Property"
                              >
                                <Check size={18} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleRejectProperty(property.id)}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
                                title="Reject Property"
                              >
                                <X size={18} />
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!property.flagged ? (
                              <button 
                                onClick={() => handleFlagProperty(property.id)}
                                className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition"
                                title="Flag Property"
                              >
                                <AlertCircle size={18} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleUnflagProperty(property.id)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                title="Unflag Property"
                              >
                                <AlertCircle size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-sm font-semibold text-foreground">No properties found</h3>
                      <p className="mt-1 text-sm text-muted-foreground">No properties match your search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {filteredProperties.length > 0 && (
            <div className="px-6 py-4 border-t border-border bg-secondary/10">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProperties.length} of {properties.length} properties
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}