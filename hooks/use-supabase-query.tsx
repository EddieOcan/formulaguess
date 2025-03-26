"use client"

import { useState, useEffect, useCallback } from "react"
import { useSupabase } from "@/lib/supabase-provider"

type QueryOptions = {
  retries?: number
  retryDelay?: number
  requireAuth?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function useSupabaseQuery<T>(
  queryFn: (supabase: any) => Promise<{ data: T | null; error: any }>,
  deps: any[] = [],
  options: QueryOptions = {}
) {
  const { supabase, isAuthenticated, refreshUserState, initComplete } = useSupabase()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [retryCount, setRetryCount] = useState(0)

  const {
    retries = 3,
    retryDelay = 1000,
    requireAuth = false,
    onSuccess,
    onError
  } = options

  const executeQuery = useCallback(async () => {
    console.log("QUERY: Esecuzione query. Stato:", { isAuthenticated, requireAuth, retryCount, initComplete })
    
    // Se l'inizializzazione non è completa, attendiamo
    if (!initComplete) {
      console.log("QUERY: Inizializzazione auth non completa, attendo...")
      setIsLoading(true)
      return
    }
    
    // Se l'autenticazione è richiesta e l'utente non è autenticato, non eseguire la query
    if (requireAuth && !isAuthenticated) {
      console.log("QUERY: Autenticazione richiesta ma utente non autenticato")
      setIsLoading(false)
      return
    }

    try {
      console.log("QUERY: Inizio esecuzione query...")
      setIsLoading(true)
      setError(null)
      
      const result = await queryFn(supabase)
      
      if (result.error) {
        console.log("QUERY: Query ha restituito un errore", result.error)
        // Se l'errore è di autenticazione (401), prova a refreshare il token
        if (result.error.code === "401" || result.error.status === 401) {
          console.log("QUERY: Errore di autenticazione, provo a refreshare il token")
          await refreshUserState()
          
          // Riprova la query dopo il refresh
          console.log("QUERY: Riprovo la query dopo refresh token")
          const retryResult = await queryFn(supabase)
          
          if (retryResult.error) {
            console.log("QUERY: Anche il retry ha fallito", retryResult.error)
            throw retryResult.error
          }
          
          console.log("QUERY: Retry riuscito, dati ricevuti:", retryResult.data)
          setData(retryResult.data)
          onSuccess?.(retryResult.data)
        } else {
          throw result.error
        }
      } else {
        console.log("QUERY: Query completata con successo")
        setData(result.data)
        onSuccess?.(result.data)
      }
    } catch (err) {
      console.error("QUERY: Errore nella query Supabase:", err)
      setError(err)
      onError?.(err)
      
      // Implementa il retry se ci sono ancora tentativi disponibili
      if (retryCount < retries) {
        console.log(`QUERY: Riprovo query (${retryCount + 1}/${retries})...`)
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
        }, retryDelay * (retryCount + 1)) // Backoff esponenziale
      } else {
        console.log("QUERY: Numero massimo di tentativi raggiunto")
      }
    } finally {
      setIsLoading(false)
    }
  }, [
    supabase, 
    queryFn, 
    retryCount, 
    retries, 
    retryDelay, 
    requireAuth, 
    isAuthenticated, 
    refreshUserState,
    onSuccess,
    onError,
    initComplete
  ])

  useEffect(() => {
    console.log("QUERY: Le dipendenze sono cambiate, reset retry count")
    setRetryCount(0) // Reset del contatore di retry quando cambiano le dipendenze
    
    // Esegui la query solo se l'inizializzazione è completa
    if (initComplete) {
      console.log("QUERY: Eseguo la query dopo cambio deps")
      executeQuery()
    } else {
      console.log("QUERY: Inizializzazione non completa, non eseguo la query")
    }
  }, [...deps, retryCount, initComplete])

  // Funzione per forzare il refresh dei dati
  const refetch = useCallback(() => {
    console.log("QUERY: Richiesto refetch manuale")
    setRetryCount(0)
    executeQuery()
  }, [executeQuery])

  return { data, isLoading, error, refetch }
} 