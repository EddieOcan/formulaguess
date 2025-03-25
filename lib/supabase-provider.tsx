"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
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
    detectSessionInUrl: true,
    storageKey: 'formula-guess-auth-token',
  }
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [refreshAttempts, setRefreshAttempts] = useState(0)
  const [lastSessionCheck, setLastSessionCheck] = useState<number>(Date.now())

  const checkUser = useCallback(async (retryOnError = true) => {
    console.log("Verificando stato utente...", new Date().toISOString())
    setIsLoading(true)
    try {
      const {
        data: { user },
        error: userError
      } = await supabaseClient.auth.getUser()

      if (userError) {
        console.error("Errore durante il recupero dell'utente:", userError)
        if (retryOnError && refreshAttempts < 3) {
          console.log(`Tentativo di recupero sessione (${refreshAttempts + 1}/3)...`)
          setRefreshAttempts(prev => prev + 1)
          
          // Prova a recuperare la sessione
          const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession()
          
          if (sessionError) {
            console.error("Errore durante il recupero della sessione:", sessionError)
            clearUserState()
            return
          }
          
          if (sessionData?.session) {
            // Sessione trovata, riprova a ottenere l'utente
            await new Promise(resolve => setTimeout(resolve, 500))
            return checkUser(false)
          } else {
            clearUserState()
          }
        } else {
          clearUserState()
        }
        return
      }

      setLastSessionCheck(Date.now())
      setRefreshAttempts(0)

      if (user) {
        setIsAuthenticated(true)
        setUserEmail(user.email || null)
        
        const { data, error: profileError } = await supabaseClient.from("profiles").select("role").eq("id", user.id).single()

        if (profileError) {
          console.error("Errore durante il controllo del ruolo dell'utente:", profileError)
          setIsAdmin(false)
        } else {
          setIsAdmin(data?.role === "admin")
        }
      } else {
        clearUserState()
      }
    } catch (error) {
      console.error("Errore durante la verifica dell'utente:", error)
      clearUserState()
    } finally {
      setIsLoading(false)
    }
  }, [refreshAttempts])

  const clearUserState = () => {
    setIsAuthenticated(false)
    setIsAdmin(false)
    setUserEmail(null)
  }

  // Funzione per forzare l'aggiornamento dello stato dell'utente
  const refreshUserState = useCallback(async () => {
    setRefreshAttempts(0)
    await checkUser(true)
    router.refresh()
  }, [checkUser, router])

  // Controlla se la sessione è troppo vecchia (più di 15 minuti)
  const isSessionTooOld = useCallback(() => {
    const now = Date.now()
    const fifteenMinutes = 15 * 60 * 1000
    return (now - lastSessionCheck) > fifteenMinutes
  }, [lastSessionCheck])

  useEffect(() => {
    // Proviamo a recuperare l'utente all'avvio
    checkUser()

    // Imposta un controllo periodico per l'utente ogni 5 minuti
    const intervalId = setInterval(() => {
      console.log("Controllo periodico della sessione...")
      checkUser()
    }, 5 * 60 * 1000)

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log("Cambio stato auth:", event)
      
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setIsAuthenticated(true)
        if (session?.user) {
          setUserEmail(session.user.email || null)
          try {
            const { data, error } = await supabaseClient.from("profiles").select("role").eq("id", session.user.id).single()

            if (error) {
              console.error("Errore durante il controllo del ruolo dell'utente:", error)
              setIsAdmin(false)
              return
            }

            setIsAdmin(data?.role === "admin")
          } catch (error) {
            console.error("Errore durante il controllo del ruolo dell'utente:", error)
            setIsAdmin(false)
          }
        }
      } else if (event === "SIGNED_OUT") {
        clearUserState()
      }

      router.refresh()
    })

    // Controlla lo stato dell'utente ogni volta che la finestra torna in focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Se la pagina è stata inattiva per più di 15 minuti, ricarica lo stato
        if (isSessionTooOld()) {
          console.log("Sessione troppo vecchia, aggiornamento forzato...")
          refreshUserState()
        } else {
          checkUser()
        }
      }
    }

    // Gestisce il caso in cui la rete cambia stato
    const handleOnline = () => {
      console.log("Connessione di rete ripristinata, aggiornamento stato...")
      refreshUserState()
    }

    // Aggiunge i listener per eventi del browser
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("online", handleOnline)
    window.addEventListener("focus", handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      authListener.subscription.unsubscribe()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("focus", handleVisibilityChange)
    }
  }, [checkUser, isSessionTooOld, refreshUserState, router])

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

