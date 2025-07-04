"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getProducts } from "@/lib/supabase"
import Link from "next/link"

interface Product {
  id: string
  name: string
  category: string
  price: number
  featured: boolean | null
  gift_categories: {
    name: string
  } | null
}

export function TopProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts()
        // Filter featured products first, then take the first 5
        const topProducts = data
          .sort((a, b) => {
            // Featured products first
            if (a.featured && !b.featured) return -1
            if (!a.featured && b.featured) return 1
            return 0
          })
          .slice(0, 5)
        
        setProducts(topProducts as Product[])
      } catch (error) {
        console.error("Error loading products:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
            </div>
            <div className="h-5 w-16 bg-neutral-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3">
          <div className="space-y-1">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              {product.gift_categories?.name || product.category}
            </p>
          </div>
          <div className="text-sm font-medium text-secondary">
            ₹{product.price.toLocaleString('en-IN')}
          </div>
        </div>
      ))}
      
      <Link href="/dashboard/products" className="w-full">
        <Button className="w-full bg-white border border-neutral-200 text-primary hover:bg-neutral-50">
          View all products
        </Button>
      </Link>
    </div>
  )
} 