"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppState } from "@/hooks/use-app-state"
import { useSupabase } from "@/lib/supabase-provider"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppStateWrapper({ children }: { children: React.ReactNode }) {
  const { hasBeenInactive } = useAppState()
  const { isLoading, refreshUserState, isAuthenticated } = useSupabase()
  const [loadingFailed, setLoadingFailed] = useState(false)
  const [loadingTime, setLoadingTime] = useState(0)
  const router = useRouter()

  // Un effetto che gestisce il ricaricamento automatico in caso di inattività prolungata
  useEffect(() => {
    if (hasBeenInactive) {
      console.log("Applicazione riattivata dopo inattività, stato aggiornato")
    }
  }, [hasBeenInactive])

  // Monitoriamo il tempo di caricamento e forniamo un fallback se è troppo lungo
  useEffect(() => {
    if (isLoading) {
      const startTime = Date.now()
      const timerId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        setLoadingTime(elapsed)
        
        // Se il caricamento dura più di 10 secondi, mostriamo un fallback
        if (elapsed > 10) {
          setLoadingFailed(true)
          clearInterval(timerId)
        }
      }, 1000)
      
      return () => {
        clearInterval(timerId)
        setLoadingFailed(false)
        setLoadingTime(0)
      }
    }
  }, [isLoading])

  // Funzione per forzare un ricaricamento completo
  const handleForceReload = () => {
    // Forza un ricaricamento completo della pagina
    window.location.reload()
  }

  // Funzione per tornare alla home e fare refresh
  const handleReturnHome = () => {
    refreshUserState()
    router.push('/')
  }

  // Mostra uno stato di fallback in caso di problemi di caricamento
  if (isLoading && loadingFailed) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
        <div className="w-full max-w-md p-6 rounded-lg bg-card shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Problema di caricamento</h2>
            <p className="text-muted-foreground mb-4">
              Il caricamento sta impiegando più tempo del previsto ({loadingTime} secondi).
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="default" onClick={handleForceReload} className="w-full">
                Ricarica completamente
              </Button>
              <Button variant="outline" onClick={handleReturnHome} className="w-full">
                Torna alla home
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mostra un indicatore di caricamento quando il caricamento è in corso
  if (isLoading && loadingTime > 3) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4 bg-card px-6 py-4 rounded-lg shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-center text-muted-foreground">
            Caricamento in corso... ({loadingTime}s)
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 