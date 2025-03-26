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
  const { supabase, isAuthenticated, refreshUserState } = useSupabase()
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
    // Se l'autenticazione è richiesta e l'utente non è autenticato, non eseguire la query
    if (requireAuth && !isAuthenticated) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const result = await queryFn(supabase)
      
      if (result.error) {
        // Se l'errore è di autenticazione (401), prova a refreshare il token
        if (result.error.code === "401" || result.error.status === 401) {
          console.log("Errore di autenticazione, provo a refreshare il token")
          await refreshUserState()
          
          // Riprova la query dopo il refresh
          const retryResult = await queryFn(supabase)
          
          if (retryResult.error) {
            throw retryResult.error
          }
          
          setData(retryResult.data)
          onSuccess?.(retryResult.data)
        } else {
          throw result.error
        }
      } else {
        setData(result.data)
        onSuccess?.(result.data)
      }
    } catch (err) {
      console.error("Errore nella query Supabase:", err)
      setError(err)
      onError?.(err)
      
      // Implementa il retry se ci sono ancora tentativi disponibili
      if (retryCount < retries) {
        console.log(`Riprovo query (${retryCount + 1}/${retries})...`)
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
        }, retryDelay * (retryCount + 1)) // Backoff esponenziale
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
    onError
  ])

  useEffect(() => {
    setRetryCount(0) // Reset del contatore di retry quando cambiano le dipendenze
    executeQuery()
  }, [...deps, retryCount, executeQuery])

  // Funzione per forzare il refresh dei dati
  const refetch = useCallback(() => {
    setRetryCount(0)
    executeQuery()
  }, [executeQuery])

  return { data, isLoading, error, refetch }
} 