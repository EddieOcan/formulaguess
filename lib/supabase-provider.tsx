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
  initComplete: boolean
}

const Context = createContext<SupabaseContext | undefined>(undefined)

// Configurazione migliorata del client Supabase
const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'supabase-formula-guess-auth',
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
})

// Attiva il refresh automatico dei token
supabaseClient.auth.startAutoRefresh()

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [initComplete, setInitComplete] = useState(false)

  // Recupera la sessione all'avvio
  const initializeAuth = async () => {
    try {
      setIsLoading(true)
      
      // Primo tentativo: recupera la sessione esistente
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession()
      
      if (sessionError) {
        console.error("Errore nel recupero della sessione:", sessionError)
        resetAuthState()
        return
      }
      
      if (sessionData?.session) {
        const { data: userData, error: userError } = await supabaseClient.auth.getUser()
        
        if (userError || !userData.user) {
          console.log("Sessione presente ma utente non recuperabile, effettuo logout")
          await supabaseClient.auth.signOut()
          resetAuthState()
          return
        }
        
        // Utente autenticato con successo
        setIsAuthenticated(true)
        setUserEmail(userData.user.email || null)
        
        // Recupera info profilo
        try {
          const { data: profileData, error: profileError } = await supabaseClient
            .from("profiles")
            .select("role")
            .eq("id", userData.user.id)
            .single()
          
          if (profileError) {
            console.error("Errore nel recupero profilo:", profileError)
            setIsAdmin(false)
          } else {
            setIsAdmin(profileData?.role === "admin")
          }
        } catch (profileError) {
          console.error("Eccezione nel recupero profilo:", profileError)
          setIsAdmin(false)
        }
      } else {
        resetAuthState()
      }
    } catch (error) {
      console.error("Errore durante l'inizializzazione auth:", error)
      resetAuthState()
    } finally {
      setIsLoading(false)
      setInitComplete(true)
    }
  }
  
  const resetAuthState = () => {
    setIsAuthenticated(false)
    setIsAdmin(false)
    setUserEmail(null)
  }

  // Effetto per l'inizializzazione
  useEffect(() => {
    initializeAuth()
    
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Evento auth:", event)
        
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          initializeAuth()
        } else if (event === "SIGNED_OUT") {
          resetAuthState()
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
      supabaseClient.auth.stopAutoRefresh()
    }
  }, [])

  // Valore del contesto
  const contextValue = {
    supabase: supabaseClient,
    isAdmin,
    isLoading,
    refreshUserState: initializeAuth,
    isAuthenticated,
    userEmail,
    initComplete
  }

  return (
    <Context.Provider value={contextValue}>
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

