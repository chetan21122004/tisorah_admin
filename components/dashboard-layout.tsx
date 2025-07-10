"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { 
  Box, 
  Gift, 
  ImageIcon, 
  LayoutDashboard, 
  Menu, 
  MessageSquare, 
  Quote, 
  Settings, 
  Users, 
  PackageOpen, 
  FileText, 
  BookOpen,
  LogOut,
  User
} from "lucide-react"
import { toast } from "sonner"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Gift,
  },
 
  {
    title: "Quote Requests",
    href: "/dashboard/quotes",
    icon: Quote,
  },
  {
    title: "Testimonials",
    href: "/dashboard/testimonials",
    icon: MessageSquare,
  },
 
  {
    title: "FAQs",
    href: "/dashboard/faqs",
    icon: FileText,
  },
  {
    title: "Blogs",
    href: "/dashboard/blogs",
    icon: BookOpen,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 pr-0 bg-neutral-50">
              <div className="flex flex-col gap-2">
                <div className="flex h-16 items-center border-b px-4">
                  <Link href="/dashboard" className="flex items-center gap-2 font-serif text-lg font-semibold">
                    <span className="text-primary">TISORAH</span>
                    <span className="text-xs text-muted-foreground">ADMIN</span>
                  </Link>
                </div>
                <nav className="grid gap-1 px-2 py-4">
                  {sidebarItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-secondary ${
                        pathname === item.href ? "bg-neutral-100 font-medium text-secondary" : "text-muted-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto p-2">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex w-full items-center justify-between gap-2">
            <Link href="/dashboard" className="flex items-center gap-2 font-serif text-lg font-semibold">
              <span className="text-primary">TISORAH</span>
              <span className="text-xs text-muted-foreground">ADMIN</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </header>
        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar className="hidden border-r border-neutral-200 bg-neutral-50 lg:flex">
            <SidebarHeader className="border-b border-neutral-200 bg-neutral-50">
              <Link href="/dashboard" className="flex items-center gap-2 px-6 py-4">
                <span className="text-xl font-serif font-semibold text-primary">TISORAH</span>
                <span className="text-xs text-muted-foreground">ADMIN</span>
              </Link>
            </SidebarHeader>
            <SidebarContent className="p-2">
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                      <Link href={item.href} className={pathname === item.href ? "text-secondary" : ""}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t border-neutral-200 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>tisorah-admin</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <div className="text-xs text-muted-foreground">Tisorah Admin v1.0</div>
            </SidebarFooter>
          </Sidebar>
          {/* Main content */}
          <main className="flex-1 overflow-auto bg-neutral-50 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
