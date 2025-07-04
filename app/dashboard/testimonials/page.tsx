"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, MoreHorizontal, Plus, Search, Star, Trash, X } from "lucide-react"

// Mock testimonial data
const testimonials = [
  {
    id: "1",
    name: "Sarah Johnson",
    company: "Acme Corp",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    content:
      "The corporate gift boxes were perfect for our annual client appreciation event. The quality of products and attention to detail exceeded our expectations.",
    status: "approved",
  },
  {
    id: "2",
    name: "Michael Chen",
    company: "TechStart Inc",
    image: "/placeholder.svg?height=80&width=80",
    rating: 4,
    content:
      "We ordered welcome kits for our new employees and they were a hit! The branding was spot-on and the packaging was elegant.",
    status: "pending",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    company: "Global Solutions",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    content:
      "The anniversary gift sets we ordered were delivered on time and our team loved them. Will definitely order again for future celebrations.",
    status: "approved",
  },
  {
    id: "4",
    name: "David Kim",
    company: "Innovate LLC",
    image: "/placeholder.svg?height=80&width=80",
    rating: 4,
    content:
      "The custom branded mugs were a perfect addition to our office rebranding. Great quality and fast delivery.",
    status: "pending",
  },
]

export default function TestimonialsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    company: "",
    rating: 5,
    content: "",
  })

  // Filter testimonials based on search query and status filter
  const filteredTestimonials = testimonials.filter((testimonial) => {
    const matchesSearch =
      testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || testimonial.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Handle adding a new testimonial
  const handleAddTestimonial = () => {
    // In a real app, this would be an API call
    console.log("Adding new testimonial:", newTestimonial)
    setIsAddDialogOpen(false)
    setNewTestimonial({
      name: "",
      company: "",
      rating: 5,
      content: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground">Manage customer testimonials and reviews</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Testimonial</DialogTitle>
              <DialogDescription>Add a new customer testimonial to showcase on your website.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input
                  id="name"
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newTestimonial.company}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, company: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rating">Rating</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={rating <= newTestimonial.rating ? "text-yellow-500" : "text-muted-foreground"}
                      onClick={() => setNewTestimonial({ ...newTestimonial, rating })}
                    >
                      <Star className="h-5 w-5" fill={rating <= newTestimonial.rating ? "currentColor" : "none"} />
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Testimonial</Label>
                <Textarea
                  id="content"
                  value={newTestimonial.content}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                  placeholder="Enter testimonial content"
                  className="min-h-32"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTestimonial}>Add Testimonial</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search testimonials..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")}>
            All
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "approved" ? "default" : "outline"}
            onClick={() => setStatusFilter("approved")}
          >
            Approved
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTestimonials.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No testimonials found.</p>
          </div>
        ) : (
          filteredTestimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <CardTitle className="text-base">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.company}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {testimonial.status === "pending" && (
                        <DropdownMenuItem>
                          <Check className="mr-2 h-4 w-4" /> Approve
                        </DropdownMenuItem>
                      )}
                      {testimonial.status === "approved" && (
                        <DropdownMenuItem>
                          <X className="mr-2 h-4 w-4" /> Unapprove
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={`h-4 w-4 ${
                        rating <= testimonial.rating ? "text-yellow-500 fill-current" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{testimonial.content}</p>
              </CardContent>
              <CardFooter>
                <Badge variant={testimonial.status === "approved" ? "default" : "secondary"}>
                  {testimonial.status === "approved" ? "Approved" : "Pending"}
                </Badge>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
