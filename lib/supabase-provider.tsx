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
  refreshUserState: () => Promise<void>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

// Crea un singleton client per evitare di creare più istanze
const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkUser = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
        error: userError
      } = await supabaseClient.auth.getUser()

      if (userError) {
        console.error("Error getting user:", userError)
        setIsAdmin(false)
        return
      }

      if (user) {
        const { data, error: profileError } = await supabaseClient.from("profiles").select("role").eq("id", user.id).single()

        if (profileError) {
          console.error("Error checking user role:", profileError)
          setIsAdmin(false)
          return
        }

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

  // Funzione per forzare l'aggiornamento dello stato dell'utente
  const refreshUserState = async () => {
    await checkUser()
  }

  useEffect(() => {
    checkUser()

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)
      
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          try {
            const { data, error } = await supabaseClient.from("profiles").select("role").eq("id", session.user.id).single()

            if (error) {
              console.error("Error checking user role:", error)
              setIsAdmin(false)
              return
            }

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

    // Controlla lo stato dell'utente ogni volta che la finestra torna in focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkUser()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      authListener.subscription.unsubscribe()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [router])

  return (
    <Context.Provider value={{ supabase: supabaseClient, isAdmin, isLoading, refreshUserState }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}

