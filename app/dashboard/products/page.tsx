"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Plus, Search, SlidersHorizontal, Loader2 } from "lucide-react"
import { getProductsPaginated, getCategories } from "@/lib/supabase"
import { toast } from "sonner"
import Link from "next/link"

interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  type: 'edible' | 'non_edible'
  level: 'main' | 'primary' | 'secondary'
  description?: string
  image_url?: string | null
  created_at?: string | null
  updated_at?: string | null
  count?: number | null
}

interface Product {
  id: string
  name: string
  price: number
  price_min: number | null
  price_max: number | null
  has_price_range: boolean | null
  images: string[] | null
  display_image: string | null
  hover_image: string | null
  featured: boolean | null
  customizable: boolean | null
  created_at: string | null
  main_category: string | null
  primary_category: string | null
  secondary_category: string | null
  main_category_data: {
    id: string
    name: string
    slug: string
    type: 'edible' | 'non_edible'
    level: 'main'
  } | null
  primary_category_data: {
    id: string
    name: string
    slug: string
    type: 'edible' | 'non_edible'
    level: 'primary'
    description?: string
  } | null
  secondary_category_data: {
    id: string
    name: string
    slug: string
    type: 'edible' | 'non_edible'
    level: 'secondary'
    description?: string
  } | null
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [showFilters, setShowFilters] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProductsPaginated(1, 20, searchTerm, selectedCategory, sortBy, sortOrder),
          getCategories()
        ])
        
        setProducts(productsData.products as Product[])
        setHasMore(productsData.hasMore)
        setCategories(categoriesData as Category[])
      } catch (error) {
        console.error("Error loading initial data:", error)
        toast.error("Failed to load products")
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [])

  // Load more products when filters change
  useEffect(() => {
    if (loading) return

    const loadFilteredProducts = async () => {
      setLoading(true)
      try {
        const productsData = await getProductsPaginated(1, 20, searchTerm, selectedCategory, sortBy, sortOrder)
        setProducts(productsData.products as Product[])
        setHasMore(productsData.hasMore)
        setPage(1)
      } catch (error) {
        console.error("Error loading filtered products:", error)
        toast.error("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(loadFilteredProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, selectedCategory, sortBy, sortOrder])

  // Load more products for pagination
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const productsData = await getProductsPaginated(nextPage, 20, searchTerm, selectedCategory, sortBy, sortOrder)
      
      setProducts(prev => [...prev, ...productsData.products as Product[]])
      setHasMore(productsData.hasMore)
      setPage(nextPage)
    } catch (error) {
      console.error("Error loading more products:", error)
      toast.error("Failed to load more products")
    } finally {
      setLoadingMore(false)
    }
  }, [page, hasMore, loadingMore, searchTerm, selectedCategory, sortBy, sortOrder])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreProducts()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loadMoreProducts, hasMore, loadingMore])

  // Get categories by level
  const mainCategories = categories.filter(cat => cat.level === 'main')
  const primaryCategories = categories.filter(cat => 
    cat.level === 'primary' && 
    cat.parent_id === selectedCategory
  )

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? "" : value)
  }

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-")
    setSortBy(field)
    setSortOrder(order)
  }

  const formatPrice = (price: number | null): string => {
    if (!price) return '0'
    return price.toLocaleString('en-IN')
  }

  return (
    <div className="space-y-8 relative">
      <div className="pattern-dots pattern-opacity-10 pattern-secondary absolute inset-0 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog.</p>
        </div>
        <div className="mt-4 flex space-x-2 md:mt-0">
          <Link href="/dashboard/products/new">
            <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8 bg-white border-neutral-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white border-neutral-200"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40 bg-white border-neutral-200">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">Newest First</SelectItem>
              <SelectItem value="created_at-asc">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="price-asc">Price Low-High</SelectItem>
              <SelectItem value="price-desc">Price High-Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Category:</label>
              <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {/* Group categories by type */}
                  <SelectItem value="edible" disabled className="font-semibold text-primary">
                    Edible Gifts
                  </SelectItem>
                  {mainCategories
                    .filter(cat => cat.type === 'edible')
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id} className="pl-4">
                        {category.name}
                      </SelectItem>
                  ))}
                  <SelectItem value="non_edible" disabled className="font-semibold text-primary mt-2">
                    Non-Edible Gifts
                  </SelectItem>
                  {mainCategories
                    .filter(cat => cat.type === 'non_edible')
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id} className="pl-4">
                        {category.name}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSelectedCategory("")
                setSearchTerm("")
                setSortBy("created_at")
                setSortOrder("desc")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Card key={item} className="overflow-hidden border-neutral-200 bg-white">
              <div className="aspect-square w-full bg-neutral-100 animate-pulse" />
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-5 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 bg-neutral-200 rounded w-2/3 animate-pulse" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-4 bg-neutral-200 rounded w-1/4 animate-pulse" />
                    <div className="h-8 w-8 bg-neutral-200 rounded-full animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Link key={product.id} href={`/dashboard/products/${product.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0">
                <div className="aspect-square relative">
                  {product.display_image || (product.images?.[0]) ? (
                    <img
                      src={product.display_image || product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <span className="text-slate-400">No image</span>
                    </div>
                  )}
                  {product.main_category_data?.type && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                      product.main_category_data.type === 'edible' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {product.main_category_data.type === 'edible' ? 'Edible' : 'Non-Edible'}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="font-medium text-slate-900 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      {product.main_category_data?.name && (
                        <>
                          <span>{product.main_category_data.name}</span>
                          {product.primary_category_data?.name && (
                            <>
                              <span className="mx-1">→</span>
                              <span>{product.primary_category_data.name}</span>
                            </>
                          )}
                          {product.secondary_category_data?.name && (
                            <>
                              <span className="mx-1">→</span>
                              <span>{product.secondary_category_data.name}</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-primary font-medium">
                      {product.has_price_range
                        ? `₹${formatPrice(product.price_min)} - ₹${formatPrice(product.price_max)}`
                        : `₹${formatPrice(product.price)}`}
                    </div>
                    {product.featured && (
                      <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Featured
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          {/* Observer element for infinite scroll */}
          <div ref={observerRef} className="col-span-full h-4" />
        </div>
      )}

      {loadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">No products found</h2>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
