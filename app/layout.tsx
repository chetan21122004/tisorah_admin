import type React from "react"
import type { Metadata } from "next"
import { Poppins, Frank_Ruhl_Libre } from "next/font/google"
import "./globals.css"
import "@/styles/patterns.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

const frankRuhlLibre = Frank_Ruhl_Libre({
  subsets: ["latin"],
  variable: "--font-frank",
})

export const metadata: Metadata = {
  title: "Tisorah Admin - Corporate Gifting Management",
  description: "Admin dashboard for Tisorah corporate gifting platform",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${frankRuhlLibre.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
