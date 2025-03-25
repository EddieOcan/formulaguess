"use client"

import { useEffect, useState, useCallback } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"

export function useAppState() {
  const { refreshUserState, isAuthenticated } = useSupabase()
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now())
  const [hasBeenInactive, setHasBeenInactive] = useState(false)
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online')
  const [recoveryAttempts, setRecoveryAttempts] = useState(0)
  const router = useRouter()

  // Verifica e gestisce un possibile stato inconsistente
  const checkStateConsistency = useCallback(async () => {
    // Controlla se l'utente dovrebbe essere autenticato ma c'è qualche problema
    const hasLocalStorage = typeof window !== 'undefined' && !!localStorage.getItem('formula-guess-auth-token')
    
    if (hasLocalStorage && !isAuthenticated) {
      console.log("Rilevato stato inconsistente: token locale presente ma utente non autenticato")
      if (recoveryAttempts < 3) {
        console.log(`Tentativo di ripristino (${recoveryAttempts + 1}/3)...`)
        setRecoveryAttempts(prev => prev + 1)
        await refreshUserState()
      } else if (recoveryAttempts >= 3) {
        console.log("Troppi tentativi falliti, reindirizzo alla home")
        // Se dopo 3 tentativi non riusciamo a recuperare, reindirizza alla home
        router.push("/")
      }
    } else {
      // Reset dei tentativi se tutto sembra ok
      setRecoveryAttempts(0)
    }
  }, [isAuthenticated, recoveryAttempts, refreshUserState, router])

  useEffect(() => {
    // Esegui il controllo di consistenza all'avvio
    checkStateConsistency()
  }, [checkStateConsistency, isAuthenticated])

  useEffect(() => {
    // Aggiorna il timestamp dell'ultima attività dell'utente
    const updateActivityTimestamp = () => {
      setLastActivityTime(Date.now())
      setHasBeenInactive(false)
    }

    // Gestisci il caso in cui la pagina torna in focus dopo essere stata inattiva
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        const currentTime = Date.now()
        const inactiveTime = currentTime - lastActivityTime

        // Se sono passati più di 5 minuti dall'ultima attività
        if (inactiveTime > 5 * 60 * 1000) {
          setHasBeenInactive(true)
          // Forza l'aggiornamento dello stato dell'utente
          await refreshUserState()
          // Aggiorna la pagina corrente
          router.refresh()
          // Verifica di nuovo se lo stato è consistente
          checkStateConsistency()
        }

        setLastActivityTime(currentTime)
      }
    }

    // Gestisci anche altri eventi di interazione dell'utente
    const handleUserInteraction = () => {
      if (hasBeenInactive) {
        setHasBeenInactive(false)
        router.refresh()
      }
      setLastActivityTime(Date.now())
    }

    // Gestisce i cambiamenti di stato della rete
    const handleOnline = () => {
      setNetworkStatus('online')
      // Quando la connessione viene ripristinata, verifica lo stato dell'auth
      refreshUserState()
    }

    const handleOffline = () => {
      setNetworkStatus('offline')
    }

    // Aggiungi gli event listener
    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("keydown", handleUserInteraction)
    document.addEventListener("mousemove", handleUserInteraction)
    document.addEventListener("touchstart", handleUserInteraction)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Rimuovi gli event listener quando il componente viene smontato
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
      document.removeEventListener("mousemove", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [lastActivityTime, hasBeenInactive, refreshUserState, router, checkStateConsistency])

  // Imposta un timer per verificare periodicamente la coerenza dello stato
  useEffect(() => {
    const consistencyCheckInterval = setInterval(() => {
      // Verifica lo stato ogni 30 secondi
      checkStateConsistency()
    }, 30 * 1000)

    return () => clearInterval(consistencyCheckInterval)
  }, [checkStateConsistency])

  return {
    hasBeenInactive,
    networkStatus,
    refreshState: async () => {
      await refreshUserState()
      router.refresh()
    },
    forceReload: () => {
      window.location.reload()
    }
  }
} 