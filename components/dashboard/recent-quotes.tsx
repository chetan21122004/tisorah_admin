"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getQuoteRequests } from "@/lib/supabase"
import Link from "next/link"

interface QuoteRequest {
  id: string
  name: string
  company: string
  email: string
  created_at: string | null
  shortlisted_products: any
  status: string | null
}

export function RecentQuotes() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadQuotes() {
      try {
        const data = await getQuoteRequests()
        // Sort by date and take the 5 most recent
        const sortedQuotes = data
          .sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
            return dateB - dateA
          })
          .slice(0, 5)
        
        setQuotes(sortedQuotes as QuoteRequest[])
      } catch (error) {
        console.error("Error loading quote requests:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadQuotes()
  }, [])

  // Format relative time
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return ""
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-neutral-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No quote requests found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {quotes.map((quote) => (
        <div key={quote.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3">
          <div className="space-y-1">
            <p className="font-medium">{quote.name}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{quote.company}</span>
              <span className="mx-2">•</span>
              <span>
                {quote.shortlisted_products && Array.isArray(quote.shortlisted_products) 
                  ? `${quote.shortlisted_products.length} products` 
                  : 'No products'}
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">{formatRelativeTime(quote.created_at)}</div>
        </div>
      ))}
      
      <Link href="/dashboard/quotes" className="w-full">
        <Button className="w-full bg-white border border-neutral-200 text-primary hover:bg-neutral-50">
          View all requests
        </Button>
      </Link>
    </div>
  )
} 