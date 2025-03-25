"use client"

import { useEffect, useState } from "react"
import { useAppState } from "@/hooks/use-app-state"
import { useToast } from "@/hooks/use-toast"

export default function AppStateWrapper({ children }: { children: React.ReactNode }) {
  const { hasBeenInactive, needsFullReload, refreshState, forceReload } = useAppState()
  const { toast } = useToast()
  const [checksPerformed, setChecksPerformed] = useState(0)

  // Effetto per gestire l'inattività e i ricaricamenti
  useEffect(() => {
    if (hasBeenInactive) {
      console.log("Applicazione riattivata dopo inattività, stato aggiornato")
      
      // Notifica l'utente solo se non è ancora stato risolto
      toast({
        title: "Aggiornamento stato",
        description: "L'applicazione è stata aggiornata dopo un periodo di inattività",
        duration: 3000,
      })
    }
  }, [hasBeenInactive, toast])

  // Effetto per gestire la necessità di ricaricamento completo
  useEffect(() => {
    if (needsFullReload) {
      console.log("È necessario un ricaricamento completo della pagina")
      
      toast({
        title: "Ricaricamento necessario",
        description: "Ricaricamento della pagina in corso...",
        duration: 2000,
      })
      
      // Diamo un po' di tempo per mostrare il toast prima di ricaricare
      const timer = setTimeout(() => {
        forceReload()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [needsFullReload, forceReload, toast])

  // Controllo aggiuntivo per verificare la presenza di elementi critici
  useEffect(() => {
    // Verifica periodica degli elementi dell'interfaccia
    const checkUI = () => {
      if (typeof window !== 'undefined' && document.visibilityState === "visible") {
        const header = document.querySelector('.f1-header')
        
        // Se gli elementi critici non sono presenti
        if (!header && checksPerformed < 3) {
          console.log(`Controllo UI #${checksPerformed + 1}: elementi mancanti, tentativo di recupero...`)
          setChecksPerformed(prev => prev + 1)
          refreshState()
        } else if (!header && checksPerformed >= 3) {
          // Dopo 3 tentativi, forza un ricaricamento completo
          console.log("Troppi tentativi di recupero falliti, forzando ricaricamento completo")
          forceReload()
        }
      }
    }
    
    // Controlla immediatamente all'avvio
    const initialCheck = setTimeout(checkUI, 1000)
    
    // Poi ogni 3 secondi
    const intervalCheck = setInterval(checkUI, 3000)
    
    return () => {
      clearTimeout(initialCheck)
      clearInterval(intervalCheck)
    }
  }, [checksPerformed, refreshState, forceReload])

  return <>{children}</>
} 