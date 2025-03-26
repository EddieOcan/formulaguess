"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import LoadingFallback from "./loading-fallback"

export default function AppStateWrapper({ children }: { children: React.ReactNode }) {
  const { refreshUserState, isLoading, initComplete } = useSupabase()
  const [pageLoading, setPageLoading] = useState(true)
  const router = useRouter()

  // Effetto per gestire il caricamento iniziale della pagina
  useEffect(() => {
    // Se l'inizializzazione dell'auth è completa, possiamo nascondere il loading
    if (initComplete) {
      // Aggiungiamo un breve delay per evitare flickering
      const timer = setTimeout(() => {
        setPageLoading(false)
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [initComplete])

  // Aggiorna lo stato quando la finestra torna in focus
  useEffect(() => {
    let lastRefresh = Date.now()
    
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        // Limita il refresh a una volta ogni 30 secondi
        const now = Date.now()
        if (now - lastRefresh > 30000) {
          lastRefresh = now
          await refreshUserState()
        }
      }
    }

    // Aggiungiamo un listener per il cambio di visibilità della pagina
    document.addEventListener("visibilitychange", handleVisibilityChange)
    
    // Aggiungiamo un listener per l'evento online
    const handleOnline = () => {
      console.log("Connessione ripristinata, aggiorno lo stato")
      refreshUserState()
    }
    
    window.addEventListener("online", handleOnline)
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("online", handleOnline)
    }
  }, [refreshUserState])

  // Mostra il fallback durante l'inizializzazione o quando l'app è in caricamento
  if (pageLoading || !initComplete || isLoading) {
    return <LoadingFallback />
  }

  return <>{children}</>
} 