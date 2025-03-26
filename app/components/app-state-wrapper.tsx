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
    console.log("APP_STATE: Stato di caricamento:", { initComplete, isLoading, pageLoading })
    
    // Se l'inizializzazione dell'auth è completa, possiamo nascondere il loading
    if (initComplete) {
      console.log("APP_STATE: Inizializzazione auth completata, nascondo loading...")
      // Aggiungiamo un breve delay per evitare flickering
      const timer = setTimeout(() => {
        setPageLoading(false)
        console.log("APP_STATE: Loading nascosto")
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [initComplete, isLoading])

  // Aggiorna lo stato quando la finestra torna in focus
  useEffect(() => {
    console.log("APP_STATE: Imposto listener per visibilità pagina")
    let lastRefresh = Date.now()
    
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        console.log("APP_STATE: Pagina tornata visibile")
        // Limita il refresh a una volta ogni 30 secondi
        const now = Date.now()
        if (now - lastRefresh > 30000) {
          lastRefresh = now
          console.log("APP_STATE: Aggiorno stato utente dopo cambio visibilità")
          await refreshUserState()
        } else {
          console.log("APP_STATE: Refresh throttled - troppo recente")
        }
      }
    }

    // Aggiungiamo un listener per il cambio di visibilità della pagina
    document.addEventListener("visibilitychange", handleVisibilityChange)
    
    // Aggiungiamo un listener per l'evento online
    const handleOnline = () => {
      console.log("APP_STATE: Connessione ripristinata, aggiorno lo stato")
      refreshUserState()
    }
    
    window.addEventListener("online", handleOnline)
    
    return () => {
      console.log("APP_STATE: Rimuovo listener")
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("online", handleOnline)
    }
  }, [refreshUserState])

  // Mostra il fallback durante l'inizializzazione o quando l'app è in caricamento
  if (pageLoading || !initComplete || isLoading) {
    console.log("APP_STATE: Mostro fallback. Stato:", { pageLoading, initComplete, isLoading })
    return <LoadingFallback />
  }

  console.log("APP_STATE: Render dei figli componenti")
  return <>{children}</>
} 