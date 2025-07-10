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
import { ArrowLeft, Edit3, Trash2, Upload, X, Star, Package, Truck, Tag, Image as ImageIcon } from "lucide-react"

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

interface CategoryFromAPI {
  id: string
  name: string
  slug: string
  parent_id: string | null
  type: 'edible' | 'non_edible' | null
  level: 'main' | 'primary' | 'secondary' | null
  description: string | null
  image_url: string | null
  created_at: string | null
  updated_at: string | null
  count: number | null
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
    level: 'primary'
    description?: string
  } | null
  secondary_category_data?: {
    id: string
    name: string
    slug: string
    type: 'edible' | 'non_edible'
    level: 'secondary'
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
    cat.level === 'primary' && 
    cat.parent_id === formData.main_category
  )
  const secondaryCategories = categories.filter(cat => 
    cat.level === 'secondary' && 
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
          .filter((cat: CategoryFromAPI) => 
            cat.type && cat.level && 
            (cat.type === 'edible' || cat.type === 'non_edible') &&
            (cat.level === 'main' || cat.level === 'primary' || cat.level === 'secondary')
          )
          .map((cat: CategoryFromAPI): Category => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            parent_id: cat.parent_id,
            type: cat.type as 'edible' | 'non_edible',
            level: cat.level as 'main' | 'primary' | 'secondary',
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
          
          // Ensure has_price_range is set to true and convert to ProductFormData
          const updatedProd: ProductFormData = {
            ...prod,
            has_price_range: true,
            // If price range is not set, initialize it with the single price
            price_min: prod.price_min !== undefined ? prod.price_min : prod.price,
            price_max: prod.price_max !== undefined ? prod.price_max : prod.price,
            // Ensure all required fields are present
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
            description: prod.description || ''
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
        price: parseFloat(formData.price_min) || 0, // Set price to min price as fallback
        has_price_range: true, // Always true
        price_min: parseFloat(formData.price_min) || 0,
        price_max: parseFloat(formData.price_max) || 0,
        moq: formData.moq ? parseFloat(formData.moq) : null
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/products">
              <Button variant="ghost" size="sm" className="hover:bg-white/50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Product Details</h1>
              <p className="text-slate-600 mt-1">Manage your product information and settings</p>
            </div>
          </div>
          
          {!editMode && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setEditMode(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Product
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errorMsg}</p>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{successMsg}</p>
          </div>
        )}

        {editMode ? (
          <form onSubmit={handleUpdate} className="space-y-8">
            {/* Product Images */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <CardTitle className="text-xl">Product Images</CardTitle>
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      multiple
                      className="hidden"
                      id="product-images-upload"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageUploading}
                      className="bg-white hover:bg-slate-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {imageUploading ? "Uploading..." : "Upload Images"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {formData.images && formData.images.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {formData.images.map((img: string, idx: number) => (
                        <div key={img} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-primary transition-colors">
                            <img src={img} alt={`Product image ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleImageDelete(img)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            disabled={imageUploading}
                          >
                            <X className="w-4 h-4" />
                          </button>

                        </div>
                      ))}
                    </div>
                    

                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No images uploaded yet</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageUploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Your First Image
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Information */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700">Product Name *</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      className="bg-white border-slate-300 focus:border-primary focus:ring-primary"
                      placeholder="Enter product name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="moq" className="text-sm font-medium text-slate-700">Minimum Order Quantity</Label>
                    <Input 
                      id="moq" 
                      name="moq" 
                      type="number"
                      value={formData.moq || ""} 
                      onChange={handleChange} 
                      className="bg-white border-slate-300 focus:border-primary focus:ring-primary"
                      placeholder="e.g., 10"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium text-slate-700">Price Range (₹) *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price_min" className="text-sm text-slate-600">Minimum Price</Label>
                      <Input 
                        id="price_min" 
                        name="price_min" 
                        type="number" 
                        value={formData.price_min || ""} 
                        onChange={handleChange} 
                        className="bg-white border-slate-300 focus:border-primary focus:ring-primary"
                        placeholder="₹0"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price_max" className="text-sm text-slate-600">Maximum Price</Label>
                      <Input 
                        id="price_max" 
                        name="price_max" 
                        type="number" 
                        value={formData.price_max || ""} 
                        onChange={handleChange} 
                        className="bg-white border-slate-300 focus:border-primary focus:ring-primary"
                        placeholder="₹0"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Categories Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2.5">
                    <Label htmlFor="main_category" className="text-sm font-medium">Main Category <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.main_category || "none"} 
                      onValueChange={(value) => handleSelectChange("main_category", value)}
                      disabled={!editMode}
                    >
                      <SelectTrigger className="h-10 bg-white border-neutral-200 focus:ring-primary/20">
                        <SelectValue placeholder="Select main category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
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
                      value={formData.primary_category || "none"}
                      onValueChange={(value) => handleSelectChange("primary_category", value)}
                      disabled={!editMode || !formData.main_category || primaryCategories.length === 0}
                    >
                      <SelectTrigger className="h-10 bg-white border-neutral-200 focus:ring-primary/20">
                        <SelectValue placeholder="Select primary category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
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
                      value={formData.secondary_category || "none"}
                      onValueChange={(value) => handleSelectChange("secondary_category", value)}
                      disabled={!editMode || !formData.primary_category || secondaryCategories.length === 0}
                    >
                      <SelectTrigger className="h-10 bg-white border-neutral-200 focus:ring-primary/20">
                        <SelectValue placeholder="Select secondary category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
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

                <div className="space-y-2">
                  <Label htmlFor="delivery" className="text-sm font-medium text-slate-700">Delivery Information</Label>
                  <Input 
                    id="delivery" 
                    name="delivery" 
                    value={formData.delivery || ""} 
                    onChange={handleChange} 
                    className="bg-white border-slate-300 focus:border-primary focus:ring-primary"
                    placeholder="e.g., 3-5 business days"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description || ""} 
                    onChange={handleChange} 
                    className="min-h-32 bg-white border-slate-300 focus:border-primary focus:ring-primary"
                    placeholder="Describe your product..."
                  />
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="featured" 
                      checked={!!formData.featured} 
                      onCheckedChange={(checked: boolean | "indeterminate") => handleCheckboxChange("featured", !!checked)} 
                    />
                    <Label htmlFor="featured" className="text-sm font-medium text-slate-700">Featured Product</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="customizable" 
                      checked={!!formData.customizable} 
                      onCheckedChange={(checked: boolean | "indeterminate") => handleCheckboxChange("customizable", !!checked)} 
                    />
                    <Label htmlFor="customizable" className="text-sm font-medium text-slate-700">Customizable</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setEditMode(false)
                  setFormData(product as ProductFormData)
                  // Remove edit parameter from URL
                  const url = new URL(window.location.href)
                  url.searchParams.delete('edit')
                  window.history.replaceState({}, '', url.toString())
                }}
                className="bg-white hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updating}
                className="bg-primary hover:bg-primary/90 min-w-32"
              >
                {updating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="aspect-square bg-slate-100">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.display_image || product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">No image available</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-primary transition-colors cursor-pointer">
                      <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-800 mb-2">{product.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-4">
                        {product.featured && (
                          <Badge className="bg-primary text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {product.customizable && (
                          <Badge variant="outline" className="border-primary text-primary">
                            Customizable
                          </Badge>
                        )}
                        {product.main_category_data?.type && (
                          <Badge variant="outline" className={product.main_category_data.type === 'edible' ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500'}>
                            {product.main_category_data.type === 'edible' ? 'Edible Gift' : 'Non-Edible Gift'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {product.has_price_range 
                      ? `₹${formatPrice(Number(product.price_min))} - ₹${formatPrice(Number(product.price_max))}` 
                      : `₹${formatPrice(Number(product.price))}`}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500">Category</p>
                        <p className="font-medium text-slate-800">
                          {product.main_category_data?.name || 'Uncategorized'}
                          {product.primary_category_data?.name && (
                            <>
                              <span className="mx-2">→</span>
                              {product.primary_category_data.name}
                            </>
                          )}
                          {product.secondary_category_data?.name && (
                            <>
                              <span className="mx-2">→</span>
                              {product.secondary_category_data.name}
                            </>
                          )}
                        </p>
                        {product.secondary_category_data?.description && (
                          <p className="text-sm text-slate-500 mt-1">{product.secondary_category_data.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {product.moq && (
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-sm text-slate-500">MOQ</p>
                          <p className="font-medium text-slate-800">{product.moq} units</p>
                        </div>
                      </div>
                    )}
                    
                    {product.delivery && (
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-sm text-slate-500">Delivery</p>
                          <p className="font-medium text-slate-800">{product.delivery}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {product.description && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 