"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useMemo } from "react"
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
const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (!isMounted) return

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
  }, [router, isMounted])

  // Utilizziamo useMemo per evitare ricreazioni inutili del context value
  const contextValue = useMemo(
    () => ({
      supabase: supabaseClient,
      isAdmin,
      isLoading: !isMounted || isLoading,
    }),
    [isAdmin, isLoading, isMounted]
  )

  // Evita di renderizzare qualsiasi contenuto fino a quando il componente non è montato
  // per prevenire errori di idratazione
  if (!isMounted) {
    return null
  }

  return <Context.Provider value={contextValue}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}

