"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Edit, MoreHorizontal, Plus, Search, Trash, Upload } from "lucide-react"

// Mock portfolio data
const portfolioItems = [
  {
    id: "1",
    title: "Holiday Gift Campaign 2023",
    client: "Acme Corp",
    image: "/placeholder.svg?height=300&width=400",
    description: "Custom holiday gift boxes with branded packaging for 500+ employees.",
  },
  {
    id: "2",
    title: "Welcome Kit Design",
    client: "TechStart Inc",
    image: "/placeholder.svg?height=300&width=400",
    description: "Onboarding gift sets including branded notebooks, mugs, and tech accessories.",
  },
  {
    id: "3",
    title: "Anniversary Celebration",
    client: "Global Solutions",
    image: "/placeholder.svg?height=300&width=400",
    description: "Elegant anniversary gift sets to commemorate 25 years of business excellence.",
  },
  {
    id: "4",
    title: "Eco-Friendly Initiative",
    client: "Green Corp",
    image: "/placeholder.svg?height=300&width=400",
    description: "Sustainable gift collection featuring eco-friendly products and packaging.",
  },
  {
    id: "5",
    title: "Executive Gift Collection",
    client: "Finance Partners",
    image: "/placeholder.svg?height=300&width=400",
    description: "Premium gift sets for C-level executives and key stakeholders.",
  },
  {
    id: "6",
    title: "Team Building Gifts",
    client: "Creative Studios",
    image: "/placeholder.svg?height=300&width=400",
    description: "Custom team building gift packages to boost employee morale and engagement.",
  },
]

export default function PortfolioPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: "",
    client: "",
    description: "",
  })

  // Filter portfolio items based on search query
  const filteredPortfolioItems = portfolioItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Handle adding a new portfolio item
  const handleAddPortfolioItem = () => {
    // In a real app, this would be an API call
    console.log("Adding new portfolio item:", newPortfolioItem)
    setIsAddDialogOpen(false)
    setNewPortfolioItem({
      title: "",
      client: "",
      description: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">Showcase your past work and client projects</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Portfolio Project</DialogTitle>
              <DialogDescription>Add a new project to showcase your work and client success stories.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={newPortfolioItem.title}
                  onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, title: e.target.value })}
                  placeholder="Enter project title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client">Client Name</Label>
                <Input
                  id="client"
                  value={newPortfolioItem.client}
                  onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, client: e.target.value })}
                  placeholder="Enter client name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPortfolioItem.description}
                  onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, description: e.target.value })}
                  placeholder="Enter project description"
                  className="min-h-32"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Project Image</Label>
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Upload project image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or WEBP up to 5MB</p>
                  </div>
                  <Input id="image" type="file" accept="image/*" className="hidden" />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("image")?.click()}>
                    Choose File
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPortfolioItem}>Add Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search portfolio projects..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPortfolioItems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No portfolio projects found.</p>
          </div>
        ) : (
          filteredPortfolioItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-video">
                <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.client}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
