"use client"

import { use, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getProductById, updateProduct, deleteProduct, getCategories } from "@/lib/supabase"
import { uploadMultipleImages, deleteImage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, Edit3, Trash2, Upload, X, Star, Package, Truck, Tag, Image as ImageIcon, Loader2 } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  type: 'edible' | 'non_edible'
  level: 'main' | 'secondary' | 'tertiary' | 'quaternary'
  description?: string
  image_url?: string | null
  created_at?: string | null
  updated_at?: string | null
  count?: number | null
}

interface CategoryFromAPI {
  id: string
  name: string
  slug: string
  parent_id: string | null
  type: 'edible' | 'non_edible' | null
  level: 'main' | 'secondary' | 'tertiary' | 'quaternary' | null
  description: string | null
  image_url: string | null
  created_at: string | null
  updated_at: string | null
  count: number | null
}

interface CategoryData {
  id: string
  name: string
  slug: string
  type: 'edible' | 'non_edible'
  level: 'main' | 'secondary' | 'tertiary' | 'quaternary'
  description?: string
}

interface ProductFormData {
  id?: string
  name: string
  description?: string
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
  moq: number | null
  delivery?: string | null
  main_category_data?: {
    id: string
    name: string
    slug: string
    type: 'edible' | 'non_edible'
    level: 'main'
  } | null
  primary_category_data?: {
    id: string
    name: string
    slug: string
    type: 'edible' | 'non_edible'
    level: 'secondary'
    description?: string
  } | null
  secondary_category_data?: {
    id: string
    name: string
    slug: string
    type: 'edible' | 'non_edible'
    level: 'tertiary'
    description?: string
  } | null
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [product, setProduct] = useState<ProductFormData | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    price_min: null,
    price_max: null,
    has_price_range: null,
    images: null,
    display_image: null,
    hover_image: null,
    featured: null,
    customizable: null,
    created_at: null,
    main_category: null,
    primary_category: null,
    secondary_category: null,
    moq: null,
    delivery: null
  })
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedDisplayImageIndex, setSelectedDisplayImageIndex] = useState<number | null>(null)
  const [selectedHoverImageIndex, setSelectedHoverImageIndex] = useState<number | null>(null)

  // Check if we should open in edit mode directly
  useEffect(() => {
    const edit = searchParams.get('edit')
    if (edit === 'true') {
      setEditMode(true)
    }
  }, [searchParams])

  // Get categories by level
  const mainCategories = categories.filter(cat => cat.level === 'main')
  const primaryCategories = categories.filter(cat => 
    cat.level === 'secondary' && 
    cat.parent_id === formData.main_category
  )
  const secondaryCategories = categories.filter(cat => 
    cat.level === 'tertiary' && 
    cat.parent_id === formData.primary_category
  )

  // Get category type for the selected main category
  const selectedMainCategory = categories.find(cat => cat.id === formData.main_category)
  const categoryType = selectedMainCategory?.type || null

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
      const prod = await getProductById(id)
        const categoriesData = await getCategories()
        
        // Filter out any categories with invalid type or level and convert to proper Category type
        const validCategories = categoriesData
          .filter((cat: any) => 
            cat.type && cat.level && 
            (cat.type === 'edible' || cat.type === 'non_edible') &&
            (cat.level === 'main' || cat.level === 'secondary' || cat.level === 'tertiary' || cat.level === 'quaternary')
          )
          .map((cat: any): Category => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            parent_id: cat.parent_id,
            type: cat.type as 'edible' | 'non_edible',
            level: cat.level as 'main' | 'secondary' | 'tertiary' | 'quaternary',
            description: cat.description || undefined,
            image_url: cat.image_url,
            created_at: cat.created_at,
            updated_at: cat.updated_at,
            count: cat.count
          }))
      
      if (prod) {
        // Set initial display and hover image indices if they exist
        if (prod.display_image && prod.images) {
          const displayIndex = prod.images.findIndex(img => img === prod.display_image)
          if (displayIndex >= 0) {
            setSelectedDisplayImageIndex(displayIndex)
          }
        }
        
        if (prod.hover_image && prod.images) {
          const hoverIndex = prod.images.findIndex(img => img === prod.hover_image)
          if (hoverIndex >= 0) {
            setSelectedHoverImageIndex(hoverIndex)
          }
        }
        
          // Process category data with proper type assertions
          const processedMainCategory = prod.main_category_data && {
            id: prod.main_category_data.id,
            name: prod.main_category_data.name,
            slug: prod.main_category_data.slug,
            type: (prod.main_category_data.type || 'non_edible') as 'edible' | 'non_edible',
            level: 'main' as const
          }

          const processedPrimaryCategory = prod.primary_category_data && {
            id: prod.primary_category_data.id,
            name: prod.primary_category_data.name,
            slug: prod.primary_category_data.slug,
            type: (prod.primary_category_data.type || 'non_edible') as 'edible' | 'non_edible',
            level: 'secondary' as const,
            description: prod.primary_category_data.description || undefined
          }

          const processedSecondaryCategory = prod.secondary_category_data && {
            id: prod.secondary_category_data.id,
            name: prod.secondary_category_data.name,
            slug: prod.secondary_category_data.slug,
            type: (prod.secondary_category_data.type || 'non_edible') as 'edible' | 'non_edible',
            level: 'tertiary' as const,
            description: prod.secondary_category_data.description || undefined
          }

          const updatedProd: ProductFormData = {
          ...prod,
          has_price_range: true,
            price_min: prod.price_min ?? prod.price,
            price_max: prod.price_max ?? prod.price,
            name: prod.name || '',
            price: prod.price || 0,
            images: prod.images || null,
            display_image: prod.display_image || null,
            hover_image: prod.hover_image || null,
            featured: prod.featured || null,
            customizable: prod.customizable || null,
            created_at: prod.created_at || null,
            main_category: prod.main_category || null,
            primary_category: prod.primary_category || null,
            secondary_category: prod.secondary_category || null,
            moq: prod.moq || null,
            delivery: prod.delivery || null,
            description: prod.description || '',
            main_category_data: processedMainCategory,
            primary_category_data: processedPrimaryCategory,
            secondary_category_data: processedSecondaryCategory
        }
        
        setProduct(updatedProd)
        setFormData(updatedProd)
      } else {
        setProduct(null)
          setFormData({
            name: '',
            description: '',
            price: 0,
            price_min: null,
            price_max: null,
            has_price_range: null,
            images: null,
            display_image: null,
            hover_image: null,
            featured: null,
            customizable: null,
            created_at: null,
            main_category: null,
            primary_category: null,
            secondary_category: null,
            moq: null,
            delivery: null
          })
      }
        setCategories(validCategories)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load product data')
      } finally {
        setLoading(false)
    }
    }
    
    loadData()
  }, [id])

  const sanitizeImages = (images: any) => {
    if (!Array.isArray(images)) return null
    const arr = images.filter((img: any) => typeof img === "string" && img.length > 0)
    return arr.length > 0 ? arr : null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: ProductFormData) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean | "indeterminate") => {
    setFormData((prev: ProductFormData) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    // Convert "none" value to null
    const actualValue = value === "none" ? null : value;
    
    if (name === 'main_category') {
      // Reset primary and secondary categories when main category changes
      setFormData((prev: ProductFormData) => ({ 
        ...prev, 
        [name]: actualValue,
        primary_category: null,
        secondary_category: null 
      }))
    } else if (name === 'primary_category') {
      // Reset secondary category when primary category changes
      setFormData((prev: ProductFormData) => ({ 
        ...prev, 
        [name]: actualValue,
        secondary_category: null 
      }))
    } else {
      setFormData((prev: ProductFormData) => ({ ...prev, [name]: actualValue }))
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUpdating(true)
    setErrorMsg(null)

    // Validate form
    if (!formData.name) {
      setErrorMsg("Product name is required")
      setUpdating(false)
      return
    }
    
    if (!formData.price_min || !formData.price_max) {
      setErrorMsg("Price range is required")
      setUpdating(false)
      return
    }
    
    if (!formData.main_category) {
      setErrorMsg("Main category is required")
      setUpdating(false)
      return
    }

    try {
      const sanitizedImages = sanitizeImages(formData.images)
      
      // Use first image as display image if available
      let displayImage = sanitizedImages && sanitizedImages.length > 0 ? sanitizedImages[0] : null
      let hoverImage = sanitizedImages && sanitizedImages.length > 1 ? sanitizedImages[1] : null
      
      // Create the base product data
      const productData: any = {
        ...formData,
        images: sanitizedImages,
        price: formData.price_min ? Number(formData.price_min) : 0, // Set price to min price as fallback
        has_price_range: true, // Always true
        price_min: formData.price_min ? Number(formData.price_min) : 0,
        price_max: formData.price_max ? Number(formData.price_max) : 0,
        moq: formData.moq ? Number(formData.moq) : null
      }
      
      // Only include display_image and hover_image if they exist
      if (displayImage) {
        productData.display_image = displayImage;
      } else {
        productData.display_image = null;
      }
      
      if (hoverImage) {
        productData.hover_image = hoverImage;
      } else {
        productData.hover_image = null;
      }

      const updated = await updateProduct(id, productData)

      if (updated) {
        setSuccessMsg("Product updated successfully")
        setProduct(updated as ProductFormData)
        setFormData(updated as ProductFormData)
        setEditMode(false)
        toast.success("Product updated successfully")
        // Remove edit parameter from URL
        const url = new URL(window.location.href)
        url.searchParams.delete('edit')
        window.history.replaceState({}, '', url.toString())
      } else {
        setErrorMsg("Failed to update product. Please check all fields and try again.")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      setErrorMsg("An error occurred while updating the product")
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return
    setDeleting(true)
    try {
      const ok = await deleteProduct(id)
      if (ok) {
        toast.success("Product deleted successfully")
        router.push("/dashboard/products")
      } else {
        toast.error("Failed to delete product")
      }
    } catch (err) {
      toast.error("Error deleting product")
    } finally {
      setDeleting(false)
    }
  }

  // --- Image Management ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setImageUploading(true)
    setErrorMsg(null)
    try {
      const newUrls = await uploadMultipleImages(Array.from(e.target.files))
      const updatedImages = sanitizeImages([...(formData.images || []), ...newUrls])
      setFormData((prev: ProductFormData) => ({ ...prev, images: updatedImages }))
      // Save to DB
      const updated = await updateProduct(id, { ...formData, images: updatedImages })
      if (updated) {
        setProduct(updated as ProductFormData)
        setFormData(updated as ProductFormData)
        toast.success("Images uploaded successfully!")
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error uploading images")
      toast.error(err?.message || "Error uploading images")
    } finally {
      setImageUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleImageDelete = async (imgUrl: string) => {
    if (!confirm("Delete this image?")) return
    setImageUploading(true)
    setErrorMsg(null)
    try {
      await deleteImage(imgUrl)
      const updatedImages = sanitizeImages((formData.images || []).filter((url: string) => url !== imgUrl))
      setFormData((prev: ProductFormData) => ({ ...prev, images: updatedImages }))
      // Save to DB
      const updated = await updateProduct(id, { ...formData, images: updatedImages })
      if (updated) {
        setProduct(updated as ProductFormData)
        setFormData(updated as ProductFormData)
        toast.success("Image deleted successfully!")
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error deleting image")
      toast.error(err?.message || "Error deleting image")
    } finally {
      setImageUploading(false)
    }
  }

  const formatPrice = (price: number | null): string => {
    if (!price) return '0'
    return price.toLocaleString('en-IN')
  }

  // Update the ImageCard component for better sizing and styling
  const ImageCard = ({ 
    image, 
    index, 
    isDisplay,
    isHover,
    onSetDisplay,
    onSetHover,
    showControls = true,
    size = "medium"
  }: { 
    image: string;
    index: number;
    isDisplay?: boolean;
    isHover?: boolean;
    onSetDisplay?: () => void;
    onSetHover?: () => void;
    showControls?: boolean;
    size?: "small" | "medium" | "large";
  }) => {
    const sizeClasses = {
      small: "h-44",
      medium: "h-56",
      large: "h-72"
  }

  return (
      <div className="relative group">
        <div className={`relative rounded-lg overflow-hidden border ${isDisplay || isHover ? 'border-primary/50' : 'border-neutral-200'} bg-white transition-all duration-200 ease-in-out hover:shadow-lg ${sizeClasses[size]}`}>
          <img 
            src={image} 
            alt={`Product image ${(index + 1).toString()}`} 
            className="w-full h-full object-contain p-2"
          />
          {showControls && editMode && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-3 p-4">
              <div className="flex flex-col gap-2 w-full max-w-[180px]">
                <Button
                  type="button"
                  size="sm"
                  variant={isDisplay ? "default" : "secondary"}
                  className={`w-full ${isDisplay ? 'bg-primary hover:bg-primary/90' : 'bg-white hover:bg-white/90 text-black'}`}
                  onClick={onSetDisplay}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {isDisplay ? 'Current Display' : 'Set as Display'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={isHover ? "default" : "secondary"}
                  className={`w-full ${isHover ? 'bg-primary hover:bg-primary/90' : 'bg-white hover:bg-white/90 text-black'}`}
                  onClick={onSetHover}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {isHover ? 'Current Hover' : 'Set as Hover'}
          </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleImageDelete(image)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>
                      <div className="absolute top-2 right-2 flex gap-1">
          {isDisplay && (
            <Badge className="bg-green-500/90 text-white">
              Display
            </Badge>
          )}
          {isHover && (
            <Badge className="bg-blue-500/90 text-white">
              Hover
            </Badge>
                      )}
                    </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-slate-200 rounded-xl"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-slate-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-20 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-700 mb-2">Product Not Found</h2>
            <p className="text-slate-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link href="/dashboard/products">
              <Button className="bg-primary hover:bg-primary/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative pb-10">
      <div className="pattern-dots pattern-opacity-10 pattern-secondary absolute inset-0 pointer-events-none" />
      
      <div className="flex items-center justify-between bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-3 rounded-full bg-white border border-neutral-100 shadow-sm hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-primary">
              {editMode ? 'Edit Product' : 'Product Details'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {editMode ? 'Make changes to your product' : 'View and manage your product details'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => setEditMode(false)}
                disabled={updating}
                className="bg-white border-neutral-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="product-form"
                disabled={updating}
                className="bg-primary hover:bg-primary/90"
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/products/${id}?edit=true`)}
                className="bg-white border-neutral-200"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Product
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <form id="product-form" onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <Card className="border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b bg-neutral-50/50">
              <CardTitle className="text-lg font-medium">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-sm font-medium">Product Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Enter product name" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={!editMode}
                    className="h-10 bg-white border-neutral-200 focus:border-primary/50"
                  />
                </div>
                
                <div className="space-y-2.5">
                  <Label htmlFor="moq" className="text-sm font-medium">Minimum Order Quantity</Label>
                  <Input 
                    id="moq" 
                    name="moq" 
                    placeholder="e.g., 50" 
                    value={formData.moq || ''}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="h-10 bg-white border-neutral-200 focus:border-primary/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2.5">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Enter product description" 
                  rows={4}
                  value={formData.description || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="bg-white border-neutral-200 resize-y focus:border-primary/50"
                />
              </div>
              
              <div className="space-y-2.5">
                <Label htmlFor="delivery" className="text-sm font-medium">Delivery Information</Label>
                <Input 
                  id="delivery" 
                  name="delivery" 
                  placeholder="e.g., 3-5 business days" 
                  value={formData.delivery || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="h-10 bg-white border-neutral-200 focus:border-primary/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Price & Categories */}
          <Card className="border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b bg-neutral-50/50">
              <CardTitle className="text-lg font-medium">Pricing & Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium">Price Range (₹) <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="price_min" className="text-xs text-muted-foreground">Minimum Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">₹</span>
                      <Input 
                        id="price_min" 
                        name="price_min" 
                        type="number" 
                        placeholder="0.00" 
                        value={formData.price_min || formData.price}
                        onChange={handleChange}
                        required
                        disabled={!editMode}
                        className="h-10 bg-white border-neutral-200 pl-7 focus:border-primary/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_max" className="text-xs text-muted-foreground">Maximum Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">₹</span>
                      <Input 
                        id="price_max" 
                        name="price_max" 
                        type="number" 
                        placeholder="0.00" 
                        value={formData.price_max || formData.price}
                        onChange={handleChange}
                        required
                        disabled={!editMode}
                        className="h-10 bg-white border-neutral-200 pl-7 focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Categories Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2.5">
                  <Label htmlFor="main_category" className="text-sm font-medium">Main Category <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.main_category || ""} 
                    onValueChange={(value) => handleSelectChange("main_category", value)}
                    disabled={!editMode}
                  >
                    <SelectTrigger className="h-10 bg-white border-neutral-200 focus:ring-primary/20">
                      <SelectValue placeholder="Select main category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.type === 'edible' ? 'Edible' : 'Non-Edible'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categoryType && (
                    <p className="text-sm text-slate-500 mt-1">
                      Selected category type: {categoryType === 'edible' ? 'Edible Gifts' : 'Non-Edible Gifts'}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2.5">
                  <Label htmlFor="primary_category" className="text-sm font-medium">Primary Category</Label>
                  <Select 
                    value={formData.primary_category || ""}
                    onValueChange={(value) => handleSelectChange("primary_category", value)}
                    disabled={!editMode || !formData.main_category || primaryCategories.length === 0}
                  >
                    <SelectTrigger className="h-10 bg-white border-neutral-200 focus:ring-primary/20">
                      <SelectValue placeholder="Select primary category" />
                    </SelectTrigger>
                    <SelectContent>
                      {primaryCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                          {category.description && (
                            <span className="block text-xs text-slate-500 mt-0.5">
                              {category.description}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.primary_category && (
                    <p className="text-sm text-slate-500 mt-1">
                      {categories.find(cat => cat.id === formData.primary_category)?.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="secondary_category" className="text-sm font-medium">Secondary Category</Label>
                  <Select 
                    value={formData.secondary_category || ""}
                    onValueChange={(value) => handleSelectChange("secondary_category", value)}
                    disabled={!editMode || !formData.primary_category || secondaryCategories.length === 0}
                  >
                    <SelectTrigger className="h-10 bg-white border-neutral-200 focus:ring-primary/20">
                      <SelectValue placeholder="Select secondary category" />
                    </SelectTrigger>
                    <SelectContent>
                      {secondaryCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                          {category.description && (
                            <span className="block text-xs text-slate-500 mt-0.5">
                              {category.description}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.secondary_category && (
                    <p className="text-sm text-slate-500 mt-1">
                      {categories.find(cat => cat.id === formData.secondary_category)?.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Regular Product Images */}
          <Card className="border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b bg-neutral-50/50">
              <CardTitle className="text-lg font-medium">Additional Product Images</CardTitle>
              <p className="text-xs text-muted-foreground">Upload multiple product images to showcase different angles</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.images?.map((img, idx) => (
                  <ImageCard
                    key={img}
                    image={img}
                    index={idx}
                    isDisplay={img === formData.display_image}
                    isHover={img === formData.hover_image}
                    onSetDisplay={() => {
                      setFormData(prev => ({
                        ...prev,
                        display_image: img
                      }));
                    }}
                    onSetHover={() => {
                      setFormData(prev => ({
                        ...prev,
                        hover_image: img
                      }));
                    }}
                    showControls={editMode}
                    size="medium"
                  />
                ))}
                {editMode && (
                  <label className="aspect-square bg-neutral-100 rounded-md border border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 transition-colors text-neutral-500 hover:border-primary/30">
                    <Upload className="w-6 h-6 mb-2 text-neutral-400" />
                    <span className="text-xs font-medium">Add Image</span>
                    <span className="text-xs text-neutral-400 mt-1">Click to upload</span>
                    <input
                      type="file"
                      multiple
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar - Right 1/3 */}
        <div className="space-y-6 lg:self-start sticky top-6">
          {/* Publish Card */}
          <Card className="border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b bg-neutral-50/50">
              <CardTitle className="text-lg font-medium">Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              {editMode ? (
                <Button 
                  type="submit"
                  disabled={updating}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-11 font-medium"
                >
                  {updating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              ) : (
                <Button 
                  type="button"
                  onClick={() => router.push(`/dashboard/products/${id}?edit=true`)}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-11 font-medium"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Product
                </Button>
              )}
              
              <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200">
                <h3 className="text-sm font-medium mb-2">Product Options</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="featured"
                      checked={formData.featured || false}
                      onCheckedChange={(checked) => handleCheckboxChange("featured", checked === true)}
                      disabled={!editMode}
                    />
                    <div>
                      <Label htmlFor="featured" className="font-normal text-sm">Featured product</Label>
                      <p className="text-xs text-muted-foreground">Show this product in featured sections</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="customizable"
                      checked={formData.customizable || false}
                      onCheckedChange={(checked) => handleCheckboxChange("customizable", checked === true)}
                      disabled={!editMode}
                    />
                    <div>
                      <Label htmlFor="customizable" className="font-normal text-sm">Customizable product</Label>
                      <p className="text-xs text-muted-foreground">Allow customers to customize this product</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display & Hover Images Card */}
          <Card className="border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b bg-neutral-50/50">
              <CardTitle className="text-lg font-medium">Special Images</CardTitle>
              <p className="text-xs text-muted-foreground">These images are shown on product listings</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Display Image */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="display-image" className="text-sm font-medium">Display Image</Label>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-600 hover:bg-green-50 border-green-200">Main</Badge>
                </div>
                <div className="border rounded-md overflow-hidden shadow-sm">
                  <div className="h-36 bg-neutral-50 relative flex items-center justify-center">
                    {formData.display_image ? (
                      <>
                        <img 
                          src={formData.display_image} 
                          alt="Display image preview" 
                          className="max-h-full max-w-full object-contain" 
                        />
                        {editMode && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, display_image: null }))}
                            className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1 hover:bg-white shadow-sm"
                            style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-2">
                        <Upload className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
                        <p className="text-sm text-neutral-400">Main product image</p>
                        <p className="text-xs text-neutral-400 mt-1">Select from gallery below</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Hover Image */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hover-image" className="text-sm font-medium">Hover Image</Label>
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-200">Hover</Badge>
                </div>
                <div className="border rounded-md overflow-hidden shadow-sm">
                  <div className="h-36 bg-neutral-50 relative flex items-center justify-center">
                    {formData.hover_image ? (
                      <>
                        <img 
                          src={formData.hover_image} 
                          alt="Hover image preview" 
                          className="max-h-full max-w-full object-contain" 
                        />
                        {editMode && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, hover_image: null }))}
                            className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1 hover:bg-white shadow-sm"
                            style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-2">
                        <Upload className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
                        <p className="text-sm text-neutral-400">Hover effect image</p>
                        <p className="text-xs text-neutral-400 mt-1">Select from gallery below</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
} 