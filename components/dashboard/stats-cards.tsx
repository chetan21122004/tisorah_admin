"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProducts, getQuoteRequests, getCategories } from "@/lib/supabase"
import { ArrowUpRight, Package, ShoppingBag, Users } from "lucide-react"

export function StatsCards() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalQuotes: 0,
    pendingQuotes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [products, categories, quotes] = await Promise.all([
          getProducts(),
          getCategories(),
          getQuoteRequests()
        ])
        
        const pendingQuotes = quotes.filter(quote => 
          quote.status === "pending" || quote.status === null || quote.status === ""
        )
        
        setStats({
          totalProducts: products.length,
          totalCategories: categories.length,
          totalQuotes: quotes.length,
          pendingQuotes: pendingQuotes.length
        })
      } catch (error) {
        console.error("Error loading dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-neutral-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse" />
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                In your product catalog
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-neutral-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Product Categories</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse" />
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active categories
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-neutral-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse" />
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.totalQuotes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Quote requests received
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-neutral-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse" />
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting response
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 