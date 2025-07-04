"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Upload } from "lucide-react"
import { createBlogPost, getBlogCategories } from "@/lib/supabase"
import { uploadMultipleImages } from "@/lib/storage"
import { toast } from "sonner"
import Link from "next/link"

interface BlogCategory {
  id: number
  name: string
  slug: string
  description: string | null
}

export default function NewBlogPostPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    author: '',
    author_image: '',
    category_id: null as number | null,
    reading_time: ''
  })
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getBlogCategories()
        setCategories(data as BlogCategory[])
      } catch (error) {
        console.error("Error loading categories:", error)
        toast.error("Failed to load categories")
      }
    }
    
    loadCategories()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'category_id' ? (value === 'none' ? null : parseInt(value)) : value 
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    setImageUploading(true)
    try {
      const urls = await uploadMultipleImages(Array.from(e.target.files))
      if (urls.length > 0) {
        setFormData(prev => ({ ...prev, cover_image: urls[0] }))
        toast.success("Image uploaded successfully!")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content || !formData.author) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const blogPost = await createBlogPost(formData)
      if (blogPost) {
        toast.success("Blog post created successfully!")
        router.push("/dashboard/blogs")
      } else {
        toast.error("Failed to create blog post")
      }
    } catch (error) {
      console.error("Error creating blog post:", error)
      toast.error("An error occurred while creating the blog post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/blogs">
          <Button variant="ghost" size="sm" className="hover:bg-white/50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Create New Blog Post</h1>
          <p className="text-slate-600 mt-1">Write and publish a new blog article</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter blog post title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="url-friendly-slug"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Brief description of the blog post"
                rows={3}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your blog post content here..."
                rows={15}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Media & Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cover_image">Cover Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="cover_image"
                  name="cover_image"
                  value={formData.cover_image}
                  onChange={handleChange}
                  placeholder="Image URL or upload below"
                />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={imageUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {imageUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
              {formData.cover_image && (
                <div className="mt-2">
                  <img 
                    src={formData.cover_image} 
                    alt="Cover preview" 
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Author name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author_image">Author Image URL</Label>
                <Input
                  id="author_image"
                  name="author_image"
                  value={formData.author_image}
                  onChange={handleChange}
                  placeholder="Author profile image URL"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select value={formData.category_id?.toString() || "none"} onValueChange={(v) => handleSelectChange("category_id", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Uncategorized</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reading_time">Reading Time</Label>
                <Input
                  id="reading_time"
                  name="reading_time"
                  value={formData.reading_time}
                  onChange={handleChange}
                  placeholder="e.g., 5 min read"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/blogs">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Creating..." : "Create Blog Post"}
          </Button>
        </div>
      </form>
    </div>
  )
} 