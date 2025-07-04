"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Edit, MoreHorizontal, Plus, Search, Trash } from "lucide-react"

// Mock FAQ data
const faqs = [
  {
    id: "1",
    question: "What is the minimum order quantity for corporate gifts?",
    answer:
      "Our minimum order quantity varies by product, but typically starts at 25 pieces for most items. Some premium products may have higher MOQs.",
  },
  {
    id: "2",
    question: "How long does it take to process and deliver orders?",
    answer:
      "Standard orders typically take 7-10 business days to process and ship. Custom branded items may require 2-3 weeks depending on complexity.",
  },
  {
    id: "3",
    question: "Can you customize products with our company logo?",
    answer:
      "Yes! We offer various customization options including logo printing, engraving, embossing, and custom packaging to match your brand.",
  },
  {
    id: "4",
    question: "Do you offer bulk pricing discounts?",
    answer:
      "Yes, we provide tiered pricing based on order quantity. The more you order, the better the per-unit price. Contact us for a custom quote.",
  },
  {
    id: "5",
    question: "What payment methods do you accept?",
    answer:
      "We accept major credit cards, bank transfers, and for established corporate clients, we can arrange net payment terms.",
  },
  {
    id: "6",
    question: "Can you ship to multiple locations?",
    answer:
      "We can ship to multiple addresses within the same order. Additional shipping charges may apply for multiple destinations.",
  },
  {
    id: "7",
    question: "What is your return and exchange policy?",
    answer:
      "We accept returns within 30 days of delivery for non-customized items in original condition. Custom branded items are generally non-returnable unless there's a quality issue.",
  },
  {
    id: "8",
    question: "Do you provide samples before placing a large order?",
    answer:
      "Yes, we can provide samples for most products. Sample costs are typically deducted from your final order if you proceed with the purchase.",
  },
]

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<any>(null)
  const [newFaq, setNewFaq] = useState({
    question: "",
    answer: "",
  })

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Handle adding a new FAQ
  const handleAddFaq = () => {
    // In a real app, this would be an API call
    console.log("Adding new FAQ:", newFaq)
    setIsAddDialogOpen(false)
    setNewFaq({
      question: "",
      answer: "",
    })
  }

  // Handle editing an FAQ
  const handleEditFaq = () => {
    // In a real app, this would be an API call
    console.log("Editing FAQ:", editingFaq)
    setEditingFaq(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
          <p className="text-muted-foreground">Manage frequently asked questions for your customers</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New FAQ</DialogTitle>
              <DialogDescription>Add a new frequently asked question to help your customers.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  placeholder="Enter the question"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  placeholder="Enter the answer"
                  className="min-h-32"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFaq}>Add FAQ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search FAQs..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No FAQs found.</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <Card key={faq.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingFaq(faq)}>
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
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit FAQ Dialog */}
      <Dialog open={!!editingFaq} onOpenChange={() => setEditingFaq(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>Update the question and answer for this FAQ.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-question">Question</Label>
              <Input
                id="edit-question"
                value={editingFaq?.question || ""}
                onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                placeholder="Enter the question"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-answer">Answer</Label>
              <Textarea
                id="edit-answer"
                value={editingFaq?.answer || ""}
                onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                placeholder="Enter the answer"
                className="min-h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFaq(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditFaq}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
