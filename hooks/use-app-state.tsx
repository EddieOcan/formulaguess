"use client"

import { useEffect, useState, useCallback } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"

// Tempo in millisecondi dopo il quale consideriamo l'app inattiva
const INACTIVITY_THRESHOLD = 60 * 1000 // 1 minuto
// Tempo massimo di inattività dopo il quale forziamo un refresh completo
const FORCE_RELOAD_THRESHOLD = 5 * 60 * 1000 // 5 minuti

export function useAppState() {
  const { refreshUserState } = useSupabase()
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now())
  const [hasBeenInactive, setHasBeenInactive] = useState(false)
  const [needsFullReload, setNeedsFullReload] = useState(false)
  const router = useRouter()

  // Funzione per forzare il ricaricamento completo della pagina
  const forceReload = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }, [])

  // Funzione per aggiornare lo stato dell'applicazione
  const refreshState = useCallback(async () => {
    try {
      await refreshUserState()
      router.refresh()
      setHasBeenInactive(false)
      setNeedsFullReload(false)
    } catch (error) {
      console.error("Errore durante l'aggiornamento dello stato:", error)
      // Se c'è un errore durante l'aggiornamento, segniamo che è necessario un reload completo
      setNeedsFullReload(true)
    }
  }, [refreshUserState, router])

  useEffect(() => {
    // Aggiorna il timestamp dell'ultima attività dell'utente
    const updateActivityTimestamp = () => {
      setLastActivityTime(Date.now())
    }

    // Gestisci il caso in cui la pagina torna in focus dopo essere stata inattiva
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        const currentTime = Date.now()
        const inactiveTime = currentTime - lastActivityTime

        // Controlla se è stato inattivo abbastanza a lungo da richiedere un aggiornamento
        if (inactiveTime > INACTIVITY_THRESHOLD) {
          console.log(`App inattiva per ${inactiveTime}ms, aggiornamento dello stato...`)
          setHasBeenInactive(true)
          
          // Se l'inattività è estrema, imposta la necessità di un ricaricamento completo
          if (inactiveTime > FORCE_RELOAD_THRESHOLD) {
            console.log(`Inattività prolungata (${inactiveTime}ms), forzando ricaricamento completo...`)
            setNeedsFullReload(true)
            forceReload()
            return
          }
          
          // Altrimenti aggiorna solo lo stato
          await refreshState()
        }

        setLastActivityTime(currentTime)
      }
    }

    // Controlla periodicamente se ci sono problemi di rendering
    const checkUIInterval = setInterval(() => {
      // Controlla elementi che dovrebbero essere sempre presenti nel DOM
      const headerElement = document.querySelector('.f1-header')
      
      // Se non troviamo elementi critici che dovrebbero essere sempre presenti
      if (!headerElement && document.visibilityState === "visible") {
        console.log("Interfaccia incompleta rilevata, tentativo di aggiornamento...")
        refreshState()
      }
    }, 2000) // Controlla ogni 2 secondi

    // Gestisci anche altri eventi di interazione dell'utente
    const handleUserInteraction = () => {
      // Se l'utente interagisce con la pagina dopo inattività, aggiorna lo stato
      if (hasBeenInactive) {
        refreshState()
      }
      
      // Se è stato segnalato che serve un ricaricamento completo, eseguilo
      if (needsFullReload) {
        forceReload()
        return
      }
      
      setLastActivityTime(Date.now())
    }

    // Aggiungi gli event listener
    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("keydown", handleUserInteraction)
    document.addEventListener("mousemove", handleUserInteraction, { passive: true })
    document.addEventListener("touchstart", handleUserInteraction, { passive: true })
    
    // Controllo immediato all'avvio
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const headerElement = document.querySelector('.f1-header')
        if (!headerElement) {
          console.log("Interfaccia incompleta rilevata all'avvio, aggiornamento...")
          refreshState()
        }
      }, 500)
    }

    // Rimuovi gli event listener quando il componente viene smontato
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
      document.removeEventListener("mousemove", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
      clearInterval(checkUIInterval)
    }
  }, [lastActivityTime, hasBeenInactive, needsFullReload, refreshState, forceReload])

  return {
    hasBeenInactive,
    needsFullReload,
    refreshState,
    forceReload
  }
} 