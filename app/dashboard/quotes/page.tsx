"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Download, 
  Search, 
  SlidersHorizontal, 
  Package, 
  User, 
  Building, 
  Mail, 
  Clock
} from "lucide-react"
import { getQuoteRequests } from "@/lib/supabase"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface QuoteRequest {
  id: string
  name: string
  company: string
  email: string
  phone: string | null
  message: string | null
  budget: string | null
  timeline: string | null
  event_type: string | null
  shortlisted_products: any
  status: string | null
  created_at: string | null
  updated_at: string | null
}

export default function QuotesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  useEffect(() => {
    async function loadQuotes() {
      try {
        const data = await getQuoteRequests()
        setQuotes(data as QuoteRequest[])
      } catch (error) {
        console.error("Error loading quote requests:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadQuotes()
  }, [])
  
  const filteredQuotes = quotes
    .filter(quote => 
      quote.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.id || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(quote => statusFilter === "all" || quote.status === statusFilter);

  // Function to get badge color based on status
  const getBadgeClass = (status: string | null) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return "bg-green-100 text-green-800 border-green-200"
      case 'rejected':
        return "bg-red-100 text-red-800 border-red-200"
      case 'in-progress':
        return "bg-blue-100 text-blue-800 border-blue-200" 
      case 'completed':
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-amber-100 text-amber-800 border-amber-200" // pending or any other status
    }
  }

  // Function to get badge text based on status
  const getBadgeText = (status: string | null) => {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // Function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
  
  // Function to get total products count
  const getProductCount = (shortlistedProducts: any) => {
    if (!shortlistedProducts || !Array.isArray(shortlistedProducts)) return 0;
    
    return shortlistedProducts.reduce((total, item) => {
      const quantity = typeof item === 'object' && item.quantity ? item.quantity : 1;
      return total + quantity;
    }, 0);
  }

  return (
    <div className="space-y-8 relative">
      <div className="pattern-dots pattern-opacity-10 pattern-secondary absolute inset-0 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">Quote Requests</h1>
          <p className="text-muted-foreground mt-1">Manage customer quote requests and inquiries.</p>
        </div>
        <div className="mt-4 flex space-x-2 md:mt-0">
          <Button variant="outline" size="sm" className="bg-white border-neutral-200">
            <Calendar className="mr-2 h-4 w-4" />
            Filter by date
          </Button>
          <Button variant="outline" size="sm" className="bg-white border-neutral-200">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search quotes..."
            className="pl-8 bg-white border-neutral-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white border-neutral-200 w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="border-neutral-200 bg-white overflow-hidden">
              <div className="border-l-4 border-transparent h-full flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between p-5 pb-2 border-b border-neutral-100">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {filteredQuotes.length === 0 ? (
            <div className="col-span-full bg-white border border-neutral-200 rounded-lg p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-medium mb-2">No quote requests found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "There are no quote requests yet"}
              </p>
            </div>
          ) : (
            filteredQuotes.map((quote) => (
              <Card 
                key={quote.id} 
                className="border-neutral-200 bg-white overflow-hidden hover:shadow-md transition-all duration-200"
              >
                <Link href={`/dashboard/quotes/${quote.id}`} className="block h-full">
                  <div className={`border-l-4 ${getBadgeClass(quote.status)} h-full flex flex-col`}>
                    <CardHeader className="flex flex-row items-start justify-between p-5 pb-3 border-b border-neutral-100">
                      <div>
                        <CardTitle className="font-medium text-base flex items-center">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          {quote.name}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <Building className="mr-2 h-3.5 w-3.5" />
                          {quote.company}
                        </div>
                      </div>
                      <Badge className={`${getBadgeClass(quote.status)} font-medium`}>
                        {getBadgeText(quote.status)}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-5 flex-grow">
                      <div className="grid grid-cols-2 gap-y-4 mb-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 flex items-center">
                            <Mail className="mr-1 h-3 w-3" /> Email
                          </div>
                          <div className="text-sm font-medium truncate" title={quote.email}>
                            {quote.email}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 flex items-center">
                            <Package className="mr-1 h-3 w-3" /> Products
                          </div>
                          <div className="text-sm font-medium">
                            {getProductCount(quote.shortlisted_products)} items
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 flex items-center">
                            <Clock className="mr-1 h-3 w-3" /> Date
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(quote.created_at)}
                          </div>
                        </div>
                        
                        {quote.budget && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Budget</div>
                            <div className="text-sm font-medium">
                              {quote.budget}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end">
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Link>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
