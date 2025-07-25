"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, ImageIcon, X } from "lucide-react"
import { getCategories, createProduct } from "@/lib/supabase"
import { uploadMultipleImages } from "@/lib/storage"
import Link from "next/link"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  type?: 'edible' | 'non_edible' | null
  level?: 'main' | 'secondary' | 'tertiary' | 'quaternary'
  description?: string
  image_url?: string | null
  created_at?: string | null
  updated_at?: string | null
  count?: number | null
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [displayImageFile, setDisplayImageFile] = useState<File | null>(null)
  const [displayImagePreview, setDisplayImagePreview] = useState<string | null>(null)
  const [hoverImageFile, setHoverImageFile] = useState<File | null>(null)
  const [hoverImagePreview, setHoverImagePreview] = useState<string | null>(null)
  const [selectedDisplayImageIndex, setSelectedDisplayImageIndex] = useState<number | null>(null)
  const [selectedHoverImageIndex, setSelectedHoverImageIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "0",
    main_category: null as string | null,
    primary_category: null as string | null,
    secondary_category: null as string | null,
    moq: "",
    delivery: "",
    featured: false,
    customizable: false,
    has_price_range: true,
    price_min: "",
    price_max: "",
  })
  
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
    async function loadCategories() {
      try {
        const data = await getCategories()
        setCategories(data as Category[])
      } catch (error) {
        console.error("Error loading categories:", error)
      }
    }
    
    loadCategories()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    // Convert empty string value to null
    const actualValue = value === "" ? null : value;
    
    if (name === 'main_category') {
      // Reset primary and secondary categories when main category changes
      setFormData(prev => ({ 
        ...prev, 
        [name]: actualValue, 
        primary_category: null,
        secondary_category: null 
      }))
    } else if (name === 'primary_category') {
      // Reset secondary category when primary category changes
      setFormData(prev => ({ 
        ...prev, 
        [name]: actualValue,
        secondary_category: null 
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: actualValue }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setImageFiles(prev => [...prev, ...newFiles])
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file))
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls])
    }
  }

  const handleSpecialImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'display' | 'hover') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const url = URL.createObjectURL(file)
      
      if (type === 'display') {
        // Clear any selection from the gallery if directly uploading
        setSelectedDisplayImageIndex(null)
        
        // Clean up previous object URL if exists
        if (displayImagePreview) {
          URL.revokeObjectURL(displayImagePreview)
        }
        
        setDisplayImageFile(file)
        setDisplayImagePreview(url)
      } else if (type === 'hover') {
        // Clear any selection from the gallery if directly uploading
        setSelectedHoverImageIndex(null)
        
        // Clean up previous object URL if exists
        if (hoverImagePreview) {
          URL.revokeObjectURL(hoverImagePreview)
        }
        
        setHoverImageFile(file)
        setHoverImagePreview(url)
      }
    }
  }
  
  const clearSpecialImage = (type: 'display' | 'hover') => {
    if (type === 'display') {
      if (displayImagePreview) {
        URL.revokeObjectURL(displayImagePreview)
      }
      setDisplayImageFile(null)
      setDisplayImagePreview(null)
    } else {
      if (hoverImagePreview) {
        URL.revokeObjectURL(hoverImagePreview)
      }
      setHoverImageFile(null)
      setHoverImagePreview(null)
    }
  }

  const removeImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index])
    
    // If this was selected as display or hover image, clear that selection
    if (selectedDisplayImageIndex === index) {
      setSelectedDisplayImageIndex(null)
    }
    if (selectedHoverImageIndex === index) {
      setSelectedHoverImageIndex(null)
    }
    
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name) {
      toast.error("Product name is required")
      return
    }
    
    if (!formData.price_min || !formData.price_max) {
      toast.error("Price range is required")
      return
    }
    
    if (!formData.main_category) {
      toast.error("Main category is required")
      return
    }
    
    setLoading(true)
    
    try {
      // Upload regular images first
      let imageUrls: string[] = []
      if (imageFiles.length > 0) {
        try {
          imageUrls = await uploadMultipleImages(imageFiles)
        } catch (imageError) {
          console.error("Error uploading images:", imageError)
          toast.error("Failed to upload images")
          setLoading(false)
          return
        }
      }
      
      // Upload special images if provided
      let displayImageUrl = null
      let hoverImageUrl = null
      
      // Try to upload display image if provided
      if (displayImageFile) {
        try {
          const [uploadedDisplayUrl] = await uploadMultipleImages([displayImageFile])
          displayImageUrl = uploadedDisplayUrl
        } catch (displayImageError) {
          console.error("Error uploading display image:", displayImageError)
          // Continue with product creation even if display image upload fails
        }
      } else if (selectedDisplayImageIndex !== null && imageUrls.length > selectedDisplayImageIndex) {
        displayImageUrl = imageUrls[selectedDisplayImageIndex]
      }
      
      // Try to upload hover image if provided
      if (hoverImageFile) {
        try {
          const [uploadedHoverUrl] = await uploadMultipleImages([hoverImageFile])
          hoverImageUrl = uploadedHoverUrl
        } catch (hoverImageError) {
          console.error("Error uploading hover image:", hoverImageError)
          // Continue with product creation even if hover image upload fails
        }
      } else if (selectedHoverImageIndex !== null && imageUrls.length > selectedHoverImageIndex) {
        hoverImageUrl = imageUrls[selectedHoverImageIndex]
      }
      
      // Create product with image URLs
      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price_min) || 0, // Fallback price
        main_category: formData.main_category || null,
        primary_category: formData.primary_category || null,
        secondary_category: formData.secondary_category || null,
        moq: formData.moq ? parseFloat(formData.moq) : null,
        delivery: formData.delivery || null,
        featured: formData.featured,
        customizable: formData.customizable,
        has_price_range: true,
        price_min: parseFloat(formData.price_min) || 0,
        price_max: parseFloat(formData.price_max) || 0,
        images: imageUrls.length > 0 ? imageUrls : null
      }

      // Only add display_image and hover_image if they exist
      if (displayImageUrl) {
        productData.display_image = displayImageUrl;
      }
      
      if (hoverImageUrl) {
        productData.hover_image = hoverImageUrl;
      }
      
      const result = await createProduct(productData)
      
      if (result) {
        toast.success("Product created successfully")
        router.push("/dashboard/products")
      } else {
        toast.error("Failed to create product. Please check all required fields and try again.")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      toast.error("An error occurred while creating the product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 relative pb-10">
      <div className="pattern-dots pattern-opacity-10 pattern-secondary absolute inset-0 pointer-events-none" />
      
      <div className="flex items-center justify-between bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Link href="/dashboard/products" className="mr-3">
            <Button variant="ghost" size="icon" className="rounded-full bg-white border border-neutral-100 shadow-sm hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-primary">Add New Product</h1>
            <p className="text-sm text-muted-foreground">Create and configure your new product</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/products")}
            className="bg-white border-neutral-200"
          >
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    className="h-10 bg-white border-neutral-200 focus:border-primary/50"
                  />
                </div>
                
                <div className="space-y-2.5">
                  <Label htmlFor="moq" className="text-sm font-medium">Minimum Order Quantity</Label>
                  <Input 
                    id="moq" 
                    name="moq" 
                    placeholder="e.g., 50" 
                    value={formData.moq}
                    onChange={handleChange}
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
                  value={formData.description}
                  onChange={handleChange}
                  className="bg-white border-neutral-200 resize-y focus:border-primary/50"
                />
              </div>
              
              <div className="space-y-2.5">
                <Label htmlFor="delivery" className="text-sm font-medium">Delivery Information</Label>
                <Input 
                  id="delivery" 
                  name="delivery" 
                  placeholder="e.g., 3-5 business days" 
                  value={formData.delivery}
                  onChange={handleChange}
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
                        value={formData.price_min}
                        onChange={handleChange}
                        required
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
                        value={formData.price_max}
                        onChange={handleChange}
                        required
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
                  >
                    <SelectTrigger className="h-10 bg-white border-neutral-200 focus:ring-primary/20">
                      <SelectValue placeholder="Select main category" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Gift Type Categories */}
                      <SelectItem value="gift_types" disabled className="font-semibold text-primary">
                        Gift Types
                      </SelectItem>
                      {mainCategories
                        .filter(cat => cat.type === null)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id} className="pl-4">
                            {category.name}
                          </SelectItem>
                      ))}
                      
                      {/* Edible Categories */}
                      <SelectItem value="edible_header" disabled className="font-semibold text-primary mt-2">
                        Edible Gifts
                      </SelectItem>
                      {mainCategories
                        .filter(cat => cat.type === 'edible')
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id} className="pl-4">
                            {category.name}
                          </SelectItem>
                      ))}
                      
                      {/* Non-Edible Categories */}
                      <SelectItem value="non_edible_header" disabled className="font-semibold text-primary mt-2">
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
                  {categoryType && (
                    <p className="text-sm text-slate-500 mt-1">
                      Selected category type: {categoryType === 'edible' ? 'Edible Gifts' : categoryType === 'non_edible' ? 'Non-Edible Gifts' : 'Gift Type'}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2.5">
                  <Label htmlFor="primary_category" className="text-sm font-medium">Primary Category</Label>
                  <Select 
                    value={formData.primary_category || ""}
                    onValueChange={(value) => handleSelectChange("primary_category", value)}
                    disabled={!formData.main_category || primaryCategories.length === 0}
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
                    disabled={!formData.primary_category || secondaryCategories.length === 0}
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
              <CardTitle className="text-lg font-medium">Image Gallery</CardTitle>
              <p className="text-xs text-muted-foreground">Upload images and set display/hover images for your product</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square bg-neutral-100 rounded-md overflow-hidden group shadow-sm">
                    <img src={url} alt="preview" className="object-cover w-full h-full" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1.5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          // If this image is currently set as hover, don't allow it to be display
                          if (index === selectedHoverImageIndex) {
                            toast.error("Same image cannot be used for both display and hover")
                            return
                          }
                          setSelectedDisplayImageIndex(index === selectedDisplayImageIndex ? null : index)
                        }}
                        className={`text-xs px-2 py-1 rounded-sm ${index === selectedDisplayImageIndex ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'} transition-colors`}
                      >
                        {index === selectedDisplayImageIndex ? 'Display ✓' : 'Display'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // If this image is currently set as display, don't allow it to be hover
                          if (index === selectedDisplayImageIndex) {
                            toast.error("Same image cannot be used for both display and hover")
                            return
                          }
                          setSelectedHoverImageIndex(index === selectedHoverImageIndex ? null : index)
                        }}
                        className={`text-xs px-2 py-1 rounded-sm ${index === selectedHoverImageIndex ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'} transition-colors`}
                      >
                        {index === selectedHoverImageIndex ? 'Hover ✓' : 'Hover'}
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 flex gap-1">
                      {index === selectedDisplayImageIndex && (
                        <Badge className="bg-green-500/90 text-white">
                          Display
                        </Badge>
                      )}
                      {index === selectedHoverImageIndex && (
                        <Badge className="bg-blue-500/90 text-white">
                          Hover
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                <label className="aspect-square bg-neutral-100 rounded-md border border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 transition-colors text-neutral-500 hover:border-primary/30">
                  <Upload className="w-6 h-6 mb-2 text-neutral-400" />
                  <span className="text-xs font-medium">Add Images</span>
                  <span className="text-xs text-neutral-400 mt-1">Click to upload</span>
                  <input
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
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
              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white h-11 font-medium"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Publish Product"
                )}
              </Button>
              
              <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200">
                <h3 className="text-sm font-medium mb-2">Product Options</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleCheckboxChange("featured", checked === true)}
                    />
                    <div>
                      <Label htmlFor="featured" className="font-normal text-sm">Featured product</Label>
                      <p className="text-xs text-muted-foreground">Show this product in featured sections</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="customizable"
                      checked={formData.customizable}
                      onCheckedChange={(checked) => handleCheckboxChange("customizable", checked === true)}
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
              <p className="text-xs text-muted-foreground">Select display and hover images from your gallery below</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Display Image */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-green-500" />
                    Display Image
                  </Label>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-600 hover:bg-green-50 border-green-200">Main</Badge>
                </div>
                <div className="border rounded-md overflow-hidden shadow-sm">
                  <div className="h-36 bg-neutral-50 relative flex items-center justify-center">
                    {displayImagePreview ? (
                      <>
                        <img 
                          src={displayImagePreview} 
                          alt="Display image preview" 
                          className="max-h-full max-w-full object-contain" 
                        />
                        <button
                          type="button"
                          onClick={() => clearSpecialImage('display')}
                          className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1 hover:bg-white shadow-sm"
                          style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : selectedDisplayImageIndex !== null ? (
                      <>
                        <img 
                          src={imagePreviewUrls[selectedDisplayImageIndex]} 
                          alt="Selected display image" 
                          className="max-h-full max-w-full object-contain"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs py-1 text-center">
                          Selected from gallery
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-2">
                        <ImageIcon className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
                        <p className="text-sm text-neutral-400">No display image selected</p>
                        <p className="text-xs text-neutral-400 mt-1">Choose from gallery below</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Hover Image */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                    Hover Image
                  </Label>
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-200">Hover</Badge>
                </div>
                <div className="border rounded-md overflow-hidden shadow-sm">
                  <div className="h-36 bg-neutral-50 relative flex items-center justify-center">
                    {hoverImagePreview ? (
                      <>
                        <img 
                          src={hoverImagePreview} 
                          alt="Hover image preview" 
                          className="max-h-full max-w-full object-contain" 
                        />
                        <button
                          type="button"
                          onClick={() => clearSpecialImage('hover')}
                          className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1 hover:bg-white shadow-sm"
                          style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : selectedHoverImageIndex !== null ? (
                      <>
                        <img 
                          src={imagePreviewUrls[selectedHoverImageIndex]} 
                          alt="Selected hover image" 
                          className="max-h-full max-w-full object-contain"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs py-1 text-center">
                          Selected from gallery
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-2">
                        <ImageIcon className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
                        <p className="text-sm text-neutral-400">No hover image selected</p>
                        <p className="text-xs text-neutral-400 mt-1">Choose from gallery below</p>
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
