"use client"

import { use, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getProductById, updateProduct, deleteProduct, getCategories } from "@/lib/supabase"
import { uploadMultipleImages, deleteImage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"

interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedDisplayImageIndex, setSelectedDisplayImageIndex] = useState<number | null>(null)
  const [selectedHoverImageIndex, setSelectedHoverImageIndex] = useState<number | null>(null)

  // Get parent categories (no parent_id)
  const mainCategories = categories.filter(cat => !cat.parent_id)
  // Get subcategories for the selected main category
  const subCategories = categories.filter(cat => cat.parent_id === formData.main_category)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const prod = await getProductById(id)
      const cats = await getCategories()
      
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
        
        // Ensure has_price_range is set to true
        const updatedProd = {
          ...prod,
          has_price_range: true,
          // If price range is not set, initialize it with the single price
          price_min: prod.price_min !== undefined ? prod.price_min : prod.price,
          price_max: prod.price_max !== undefined ? prod.price_max : prod.price
        }
        
        setProduct(updatedProd)
        setFormData(updatedProd)
      } else {
        // Handle case where product is not found
        setProduct(null)
        setFormData({})
      }
      setCategories(cats)
      setLoading(false)
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
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean | "indeterminate") => {
    setFormData((prev: any) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    // Convert "none" value to null
    const actualValue = value === "none" ? null : value;
    
    if (name === 'main_category') {
      // Reset sub_category when main_category changes if it's a child of previous main category
      const currentSubCategory = formData.sub_category;
      const currentSubCategoryParent = categories.find(c => c.id === currentSubCategory)?.parent_id;
      
      if (!currentSubCategory || currentSubCategoryParent === formData.main_category) {
        setFormData((prev: any) => ({ ...prev, [name]: actualValue, sub_category: null }))
      } else {
        setFormData((prev: any) => ({ ...prev, [name]: actualValue }))
      }
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: actualValue }))
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
      
      // Prepare display and hover image values
      let displayImage = formData.display_image || null
      let hoverImage = formData.hover_image || null
      
      // If selected from gallery but not already set
      if (selectedDisplayImageIndex !== null && sanitizedImages && sanitizedImages.length > selectedDisplayImageIndex) {
        displayImage = sanitizedImages[selectedDisplayImageIndex]
      }
      
      if (selectedHoverImageIndex !== null && sanitizedImages && sanitizedImages.length > selectedHoverImageIndex) {
        hoverImage = sanitizedImages[selectedHoverImageIndex]
      }
      
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
        // Explicitly set to null if not provided to clear existing value
        productData.display_image = null;
      }
      
      if (hoverImage) {
        productData.hover_image = hoverImage;
      } else {
        // Explicitly set to null if not provided to clear existing value
        productData.hover_image = null;
      }

      const updated = await updateProduct(id, productData)

      if (updated) {
        setSuccessMsg("Product updated successfully")
        setProduct(updated)
        // Refresh the page after a short delay to show success message
        setTimeout(() => {
          router.refresh()
        }, 1500)
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
    if (!confirm("Are you sure you want to delete this product?")) return
    setDeleting(true)
    try {
      const ok = await deleteProduct(id)
      if (ok) {
        toast.success("Product deleted")
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
      setFormData((prev: any) => ({ ...prev, images: updatedImages }))
      // Save to DB
      const updated = await updateProduct(id, { ...formData, images: updatedImages })
      setProduct(updated)
      setFormData(updated)
      toast.success("Images uploaded!")
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
      setFormData((prev: any) => ({ ...prev, images: updatedImages }))
      // Save to DB
      const updated = await updateProduct(id, { ...formData, images: updatedImages })
      setProduct(updated)
      setFormData(updated)
      toast.success("Image deleted!")
    } catch (err: any) {
      setErrorMsg(err?.message || "Error deleting image")
      toast.error(err?.message || "Error deleting image")
    } finally {
      setImageUploading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (!product) {
    return <div className="p-8 text-center">Product not found.</div>
  }

  return (
    <div className="space-y-8 relative">
      <div className="pattern-dots pattern-opacity-10 pattern-secondary absolute inset-0 pointer-events-none" />
      <div className="flex items-center mb-4">
        <Link href="/dashboard/products" className="mr-4">
          <Button className="rounded-full" variant="ghost" size="icon">
            ←
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">Product Details</h1>
      </div>
      {errorMsg && <div className="text-red-600 text-sm mb-2">{errorMsg}</div>}
      {successMsg && <div className="text-green-600 text-sm mb-2">{successMsg}</div>}
      <Card className="border-neutral-200 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-serif">{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Images Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium">Images</h2>
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
                  className="bg-secondary hover:bg-secondary/90 text-white"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                >
                  {imageUploading ? "Uploading..." : "Upload Images"}
                </Button>
              </div>
            </div>
            {formData.images && formData.images.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.images.map((img: string, idx: number) => (
                    <div key={img} className="relative group border rounded-lg overflow-hidden">
                      <img src={img} alt={`Product image ${idx + 1}`} className="w-full h-40 object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleImageDelete(img)}
                          className="bg-white/80 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={imageUploading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                          </svg>
                          <span className="sr-only">Remove</span>
                        </button>
                      </div>
                      {editMode && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setSelectedDisplayImageIndex(formData.images.indexOf(img))}
                            className={`text-xs px-1 py-0.5 rounded ${selectedDisplayImageIndex === formData.images.indexOf(img) ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                          >
                            {selectedDisplayImageIndex === formData.images.indexOf(img) ? 'Display ✓' : 'Set as Display'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedHoverImageIndex(formData.images.indexOf(img))}
                            className={`text-xs px-1 py-0.5 rounded ${selectedHoverImageIndex === formData.images.indexOf(img) ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                          >
                            {selectedHoverImageIndex === formData.images.indexOf(img) ? 'Hover ✓' : 'Set as Hover'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {editMode && (
                  <div className="mt-4 border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2">Display Image</h3>
                        <div className="h-40 border rounded bg-gray-50 relative flex items-center justify-center overflow-hidden">
                          {selectedDisplayImageIndex !== null && formData.images && formData.images.length > selectedDisplayImageIndex ? (
                            <>
                              <img src={formData.images[selectedDisplayImageIndex]} alt="Display image" className="object-contain max-h-full" />
                              <button
                                type="button"
                                onClick={() => setSelectedDisplayImageIndex(null)}
                                className="absolute top-2 right-2 bg-white/80 text-red-500 rounded-full p-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 6 6 18"></path>
                                  <path d="m6 6 12 12"></path>
                                </svg>
                                <span className="sr-only">Clear</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">No display image selected</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">This image appears first on product cards</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Hover Image</h3>
                        <div className="h-40 border rounded bg-gray-50 relative flex items-center justify-center overflow-hidden">
                          {selectedHoverImageIndex !== null && formData.images && formData.images.length > selectedHoverImageIndex ? (
                            <>
                              <img src={formData.images[selectedHoverImageIndex]} alt="Hover image" className="object-contain max-h-full" />
                              <button
                                type="button"
                                onClick={() => setSelectedHoverImageIndex(null)}
                                className="absolute top-2 right-2 bg-white/80 text-red-500 rounded-full p-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 6 6 18"></path>
                                  <path d="m6 6 12 12"></path>
                                </svg>
                                <span className="sr-only">Clear</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">No hover image selected</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">This image appears when hovering over product cards</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">No images uploaded.</div>
            )}
          </div>
          {editMode ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-white border-neutral-200" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="price_range">Price Range (₹) *</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price_min">Minimum Price (₹)</Label>
                      <Input 
                        id="price_min" 
                        name="price_min" 
                        type="number" 
                        value={formData.price_min || ""} 
                        onChange={handleChange} 
                        className="bg-white border-neutral-200" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price_max">Maximum Price (₹)</Label>
                      <Input 
                        id="price_max" 
                        name="price_max" 
                        type="number" 
                        value={formData.price_max || ""} 
                        onChange={handleChange} 
                        className="bg-white border-neutral-200" 
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="main_category">Main Category</Label>
                  <Select value={formData.main_category || "none"} onValueChange={(v: string) => handleSelectChange("main_category", v)}>
                    <SelectTrigger className="bg-white border-neutral-200">
                      <SelectValue placeholder="Select main category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {mainCategories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub_category">Sub Category</Label>
                  <Select value={formData.sub_category || "none"} onValueChange={(v: string) => handleSelectChange("sub_category", v)} disabled={!formData.main_category || subCategories.length === 0}>
                    <SelectTrigger className="bg-white border-neutral-200">
                      <SelectValue placeholder="Select sub category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {subCategories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moq">Minimum Order Quantity</Label>
                  <Input id="moq" name="moq" value={formData.moq || ""} onChange={handleChange} className="bg-white border-neutral-200" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="delivery">Delivery Information</Label>
                  <Input id="delivery" name="delivery" value={formData.delivery || ""} onChange={handleChange} className="bg-white border-neutral-200" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={formData.description || ""} onChange={handleChange} className="min-h-32 bg-white border-neutral-200" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="featured" checked={!!formData.featured} onCheckedChange={(checked: boolean | "indeterminate") => handleCheckboxChange("featured", !!checked)} />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="customizable" checked={!!formData.customizable} onCheckedChange={(checked: boolean | "indeterminate") => handleCheckboxChange("customizable", !!checked)} />
                  <Label htmlFor="customizable">Customizable</Label>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditMode(false)} className="bg-white border-neutral-200">Cancel</Button>
                <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white" disabled={updating}>{updating ? "Saving..." : "Save Changes"}</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">
                    {product.has_price_range 
                      ? `₹${product.price_min} - ₹${product.price_max}` 
                      : `₹${product.price}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="font-medium">
                    {product.main_category_data?.name || 'No main category'} 
                    {product.sub_category_data?.name && ` / ${product.sub_category_data.name}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">MOQ</p>
                  <p className="font-medium">{product.moq || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Delivery</p>
                  <p className="font-medium">{product.delivery || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium whitespace-pre-line">{product.description || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Featured</p>
                  <p className="font-medium">{product.featured ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customizable</p>
                  <p className="font-medium">{product.customizable ? "Yes" : "No"}</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={() => setEditMode(true)} className="bg-secondary hover:bg-secondary/90 text-white">Edit</Button>
                <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white" disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 