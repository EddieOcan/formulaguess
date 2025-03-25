"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"

export function useAppState() {
  const { refreshUserState } = useSupabase()
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now())
  const [hasBeenInactive, setHasBeenInactive] = useState(false)
  const router = useRouter()

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

    // Aggiungi gli event listener
    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("keydown", handleUserInteraction)
    document.addEventListener("mousemove", handleUserInteraction)
    document.addEventListener("touchstart", handleUserInteraction)

    // Rimuovi gli event listener quando il componente viene smontato
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
      document.removeEventListener("mousemove", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
    }
  }, [lastActivityTime, hasBeenInactive, refreshUserState, router])

  return {
    hasBeenInactive,
    refreshState: async () => {
      await refreshUserState()
      router.refresh()
    }
  }
} 