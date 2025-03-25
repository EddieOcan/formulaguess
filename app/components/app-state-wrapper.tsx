"use client"

import { useEffect } from "react"
import { useAppState } from "@/hooks/use-app-state"

export default function AppStateWrapper({ children }: { children: React.ReactNode }) {
  const { hasBeenInactive } = useAppState()

  // Un effetto che gestisce il ricaricamento automatico in caso di inattività prolungata
  useEffect(() => {
    if (hasBeenInactive) {
      console.log("Applicazione riattivata dopo inattività, stato aggiornato")
    }
  }, [hasBeenInactive])

  return <>{children}</>
} 