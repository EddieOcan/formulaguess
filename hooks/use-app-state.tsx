"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"

export function useAppState() {
  const { refreshUserState } = useSupabase()
  const [hasBeenInactive, setHasBeenInactive] = useState(false)
  const router = useRouter()

  // Semplice effetto per rilevare l'inattività
  useEffect(() => {
    let lastActivity = Date.now()
    
    const handleActivity = () => {
      const now = Date.now()
      const inactiveTime = now - lastActivity
      
      // Se l'utente è stato inattivo per più di 5 minuti
      if (inactiveTime > 5 * 60 * 1000) {
        setHasBeenInactive(true)
        refreshUserState()
      } else {
        setHasBeenInactive(false)
      }
      
      lastActivity = now
    }
    
    // Eventi base di attività utente
    window.addEventListener("click", handleActivity)
    window.addEventListener("keydown", handleActivity)
    
    return () => {
      window.removeEventListener("click", handleActivity)
      window.removeEventListener("keydown", handleActivity)
    }
  }, [refreshUserState])

  return {
    hasBeenInactive,
    refreshState: () => {
      refreshUserState()
      router.refresh()
    },
    forceReload: () => {
      window.location.reload()
    }
  }
} 