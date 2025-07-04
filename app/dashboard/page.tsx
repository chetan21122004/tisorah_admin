"use client"

import { StatsCards } from "@/components/dashboard/stats-cards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentQuotes } from "@/components/dashboard/recent-quotes"
import { TopProducts } from "@/components/dashboard/top-products"

export default function DashboardPage() {
  return (
    <div className="space-y-8 relative">
      <div className="pattern-dots pattern-opacity-10 pattern-secondary absolute inset-0 pointer-events-none" />
      
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your Tisorah admin dashboard.</p>
      </div>
      
      <StatsCards />
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white border-neutral-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="border-neutral-200 bg-white md:col-span-4">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Recent Quote Requests</CardTitle>
                <CardDescription>
                  Latest customer inquiries requiring your attention.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentQuotes />
              </CardContent>
            </Card>
            <Card className="border-neutral-200 bg-white md:col-span-3">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Top Products</CardTitle>
                <CardDescription>
                  Most viewed and requested products.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TopProducts />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card className="border-neutral-200 bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Analytics</CardTitle>
              <CardDescription>
                Detailed analytics will be available soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">Analytics dashboard is under development.</p>
                <p className="text-sm text-muted-foreground mt-1">Check back soon for detailed insights.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card className="border-neutral-200 bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Reports</CardTitle>
              <CardDescription>
                Comprehensive reports will be available soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">Reporting functionality is under development.</p>
                <p className="text-sm text-muted-foreground mt-1">Check back soon for detailed reports.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
