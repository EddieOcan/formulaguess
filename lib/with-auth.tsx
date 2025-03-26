"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "./supabase-provider"
import LoadingFallback from "@/app/components/loading-fallback"

// Utilizziamo Props & {} per rendere TypeScript felice
export default function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthProtected(props: P) {
    const { isAuthenticated, isLoading, initComplete } = useSupabase()
    const router = useRouter()

    useEffect(() => {
      console.log("WITH_AUTH: Stato di autenticazione cambiato:", { isAuthenticated, isLoading, initComplete })
      
      // Se l'inizializzazione è completa e l'utente non è autenticato, reindirizza al login
      if (initComplete && !isLoading && !isAuthenticated) {
        console.log("WITH_AUTH: Utente non autenticato, reindirizzo al login")
        router.push("/login")
      }
    }, [isLoading, isAuthenticated, router, initComplete])

    // Durante il caricamento, mostra il componente di fallback
    if (isLoading || !initComplete) {
      console.log("WITH_AUTH: Mostro fallback. Stato:", { isLoading, initComplete })
      return <LoadingFallback />
    }

    // Se l'utente non è autenticato, non mostrare nulla mentre reindirizza
    if (!isAuthenticated) {
      console.log("WITH_AUTH: Utente non autenticato, mostro null")
      return null
    }

    // Se l'utente è autenticato, mostra il componente protetto
    console.log("WITH_AUTH: Utente autenticato, mostro componente protetto")
    return <Component {...props} />
  }
} 