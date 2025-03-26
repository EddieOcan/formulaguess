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
      // Se l'inizializzazione è completa e l'utente non è autenticato, reindirizza al login
      if (initComplete && !isLoading && !isAuthenticated) {
        console.log("Utente non autenticato, reindirizzo al login")
        router.push("/login")
      }
    }, [isLoading, isAuthenticated, router, initComplete])

    // Durante il caricamento, mostra il componente di fallback
    if (isLoading || !initComplete) {
      return <LoadingFallback />
    }

    // Se l'utente non è autenticato, non mostrare nulla mentre reindirizza
    if (!isAuthenticated) {
      return null
    }

    // Se l'utente è autenticato, mostra il componente protetto
    return <Component {...props} />
  }
} 