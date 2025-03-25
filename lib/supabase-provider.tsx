"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/database.types"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/app/env"

type SupabaseContext = {
  supabase: ReturnType<typeof createClient<Database>>
  isAdmin: boolean
  isLoading: boolean
}

const Context = createContext<SupabaseContext | undefined>(undefined)

// Crea un singleton client per evitare di creare più istanze
const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true)
      try {
        const {
          data: { user },
        } = await supabaseClient.auth.getUser()

        if (user) {
          const { data } = await supabaseClient.from("profiles").select("role").eq("id", user.id).single()

          setIsAdmin(data?.role === "admin")
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Error checking user:", error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          try {
            const { data } = await supabaseClient.from("profiles").select("role").eq("id", session.user.id).single()

            setIsAdmin(data?.role === "admin")
          } catch (error) {
            console.error("Error checking user role:", error)
            setIsAdmin(false)
          }
        }
      } else if (event === "SIGNED_OUT") {
        setIsAdmin(false)
      }

      router.refresh()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  return <Context.Provider value={{ supabase: supabaseClient, isAdmin, isLoading }}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}

