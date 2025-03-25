import type React from "react"
import type { Metadata } from "next"
import { Bricolage_Grotesque } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { SupabaseProvider } from "@/lib/supabase-provider"
import AppStateWrapper from "./components/app-state-wrapper"

const bricolage = Bricolage_Grotesque({ 
  subsets: ["latin"], 
  variable: "--font-bricolage",
  weight: ["300", "400", "500", "700"],
})

export const metadata: Metadata = {
  title: "Formula Guess",
  description: "Indovina i risultati del Gran Premio di Formula 1",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${bricolage.variable} font-sans min-h-screen bg-neutral-50 dark:bg-neutral-900 antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SupabaseProvider>
            <AppStateWrapper>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 w-full pb-12">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
            </AppStateWrapper>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'