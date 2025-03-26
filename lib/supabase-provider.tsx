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
  isAuthenticated: boolean
  userEmail: string | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

// Crea un singleton client per evitare di creare più istanze
const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Funzione semplificata per verificare l'utente
  const checkUser = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabaseClient.auth.getUser()
      
      if (error || !data.user) {
        console.log("Nessun utente autenticato")
        setIsAuthenticated(false)
        setIsAdmin(false)
        setUserEmail(null)
        return
      }
      
      // L'utente è autenticato
      setIsAuthenticated(true)
      setUserEmail(data.user.email || null)
      
      // Verifica il ruolo admin
      const { data: profileData } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()
      
      setIsAdmin(profileData?.role === "admin")
    } catch (error) {
      console.error("Errore durante il controllo dell'utente:", error)
      setIsAuthenticated(false)
      setIsAdmin(false)
      setUserEmail(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Funzione per aggiornare lo stato dell'utente
  const refreshUserState = async () => {
    await checkUser()
  }

  useEffect(() => {
    // Verifica iniziale dell'utente
    checkUser()
    
    // Ascolta i cambiamenti di stato dell'autenticazione
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await checkUser()
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false)
        setIsAdmin(false)
        setUserEmail(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return (
    <Context.Provider value={{ 
      supabase: supabaseClient, 
      isAdmin, 
      isLoading, 
      refreshUserState,
      isAuthenticated,
      userEmail
    }}>
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

