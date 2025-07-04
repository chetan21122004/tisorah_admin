"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Filter, Plus, Search, SlidersHorizontal, Edit, Trash2, Calendar, User, Clock } from "lucide-react"
import { getBlogPosts, deleteBlogPost } from "@/lib/supabase"
import { toast } from "sonner"
import Link from "next/link"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  author: string
  author_image: string
  published_at: string
  category_id: number | null
  reading_time: string
  created_at: string
  updated_at: string
}

export default function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getBlogPosts()
        setPosts(data as BlogPost[])
      } catch (error) {
        console.error("Error loading blog posts:", error)
        toast.error("Failed to load blog posts")
      } finally {
        setLoading(false)
      }
    }
    
    loadPosts()
  }, [])
  
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) return
    
    try {
      const success = await deleteBlogPost(id)
      if (success) {
        setPosts(posts.filter(post => post.id !== id))
        toast.success("Blog post deleted successfully")
      } else {
        toast.error("Failed to delete blog post")
      }
    } catch (error) {
      console.error("Error deleting blog post:", error)
      toast.error("An error occurred while deleting the blog post")
    }
  }
  
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8 relative">
      <div className="pattern-dots pattern-opacity-10 pattern-secondary absolute inset-0 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">Manage your blog content and articles.</p>
        </div>
        <div className="mt-4 flex space-x-2 md:mt-0">
          <Link href="/dashboard/blogs/new">
            <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search blog posts..."
            className="pl-8 bg-white border-neutral-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-white border-neutral-200">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="bg-white border-neutral-200">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Sort
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} className="overflow-hidden border-neutral-200 bg-white">
              <div className="aspect-video w-full bg-neutral-100 animate-pulse" />
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 bg-neutral-200 rounded w-2/3 animate-pulse" />
                  <div className="h-16 bg-neutral-200 rounded animate-pulse" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-4 bg-neutral-200 rounded w-1/3 animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-neutral-200 rounded animate-pulse" />
                      <div className="h-8 w-8 bg-neutral-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No blog posts found. Try adjusting your search or create your first post.</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden border-neutral-200 bg-white hover:border-secondary/50 transition-colors group">
                <div className="aspect-video w-full bg-neutral-100 relative overflow-hidden">
                  {post.cover_image ? (
                    <img 
                      src={post.cover_image} 
                      alt={post.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-gradient-to-br from-slate-100 to-slate-200">
                      <div className="text-center">
                        <Search className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm">No Cover Image</p>
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-secondary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.reading_time}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      <Badge variant="outline" className="text-xs">
                        {post.category_id ? `Category ${post.category_id}` : 'Uncategorized'}
                      </Badge>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/blogs/${post.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-secondary/10">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit post</span>
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete post</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
} 