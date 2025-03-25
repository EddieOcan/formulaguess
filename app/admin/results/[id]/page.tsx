"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/database.types"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type GrandPrix = Database["public"]["Tables"]["grand_prix"]["Row"]
type Event = Database["public"]["Tables"]["events"]["Row"]
type Driver = Database["public"]["Tables"]["drivers"]["Row"]
type Result = Database["public"]["Tables"]["results"]["Row"]

// Componente interno che gestisce la logica
function ResultsContent({ gpId }: { gpId: { id: string } }) {
  const [id, setId] = useState<string>("");
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [grandPrix, setGrandPrix] = useState<GrandPrix | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [results, setResults] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Estrai l'ID in modo sicuro all'interno dell'useEffect
    setId(gpId?.id || "");
  }, [gpId]);

  useEffect(() => {
    if (!id) return; // Skip if id is not yet available
    
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (!data || data.role !== "admin") {
        router.push("/dashboard")
        return
      }

      setIsAdmin(true)
      fetchData()
    }

    checkAdmin()
  }, [supabase, router, id])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Ottieni il Gran Premio
      const { data: gp, error: gpError } = await supabase.from("grand_prix").select("*").eq("id", id).single()

      if (gpError) throw gpError
      setGrandPrix(gp)

      // Ottieni gli eventi del Gran Premio
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("grand_prix_id", id)
        .order("name", { ascending: true })

      if (eventsError) throw eventsError
      setEvents(eventsData || [])

      // Ottieni i piloti
      const { data: driversData, error: driversError } = await supabase
        .from("drivers")
        .select("*")
        .eq("active", true)
        .order("name", { ascending: true })

      if (driversError) throw driversError
      setDrivers(driversData || [])

      // Ottieni i risultati esistenti
      const { data: resultsData, error: resultsError } = await supabase
        .from("results")
        .select("*")
        .in("event_id", eventsData?.map((e) => e.id) || [])

      if (resultsError) throw resultsError

      // Converti i risultati in un oggetto per un accesso più facile
      const resultsObj: Record<string, string> = {}
      resultsData?.forEach((result: Result) => {
        resultsObj[result.event_id] = result.actual_result
      })
      setResults(resultsObj)
    } catch (error) {
      console.error("Errore nel caricamento dei dati:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel caricamento dei dati",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResultChange = (eventId: string, value: string) => {
    setResults((prev) => ({
      ...prev,
      [eventId]: value,
    }))
  }

  const saveResults = async () => {
    setSaving(true)
    try {
      // Per ogni evento con un risultato, inserisci o aggiorna il risultato
      for (const eventId in results) {
        if (!results[eventId]) continue

        const { error } = await supabase.from("results").upsert(
          {
            event_id: eventId,
            actual_result: results[eventId],
          },
          {
            onConflict: "event_id",
          },
        )

        if (error) throw error
      }

      // Se tutti i risultati sono stati inseriti, imposta lo stato del Gran Premio a "completed"
      const allEventsHaveResults = events.every((event) => results[event.id])
      if (allEventsHaveResults && grandPrix?.status === "active") {
        const { error } = await supabase.from("grand_prix").update({ status: "completed" }).eq("id", id)

        if (error) throw error
      }

      toast({
        title: "Risultati salvati",
        description: "I risultati sono stati salvati con successo",
      })

      fetchData()
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante il salvataggio dei risultati",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin || loading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Risultati: {grandPrix?.name}</h1>
          <p className="text-muted-foreground">
            {new Date(grandPrix?.start_date || "").toLocaleDateString("it-IT")} -{" "}
            {new Date(grandPrix?.end_date || "").toLocaleDateString("it-IT")}
          </p>
        </div>
        <Badge variant={grandPrix?.status === "completed" ? "secondary" : "default"}>
          {grandPrix?.status === "completed" ? "Completato" : "Attivo"}
        </Badge>
      </div>

      {events.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nessun evento</AlertTitle>
          <AlertDescription>
            Non ci sono eventi per questo Gran Premio. Aggiungi eventi prima di inserire i risultati.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Importante</AlertTitle>
            <AlertDescription>
              L'inserimento dei risultati calcolerà automaticamente i punteggi degli utenti in base alle loro
              previsioni. Una volta inseriti tutti i risultati, il Gran Premio verrà contrassegnato come completato.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{event.name}</CardTitle>
                      <CardDescription>
                        {event.description || "Nessuna descrizione"} • Vale {event.points}{" "}
                        {event.points === 1 ? "punto" : "punti"}
                      </CardDescription>
                    </div>
                    {results[event.id] && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <Select
                    value={results[event.id] || ""}
                    onValueChange={(value) => handleResultChange(event.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un pilota" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.name}>
                          {driver.name} ({driver.team})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => router.push(`/admin/events/${id}`)}>
              Torna agli Eventi
            </Button>
            <Button onClick={saveResults} disabled={saving}>
              {saving ? "Salvataggio in corso..." : "Salva Risultati"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// Componente principale che passa l'oggetto params al componente interno
export default function ResultsPage({ params }: { params: { id: string } }) {
  // Non usiamo useMemo ma piuttosto uno state per prevenire accesso sincrono
  const [gpId, setGpId] = useState<{ id: string } | null>(null);
  
  // Aggiorniamo lo state in un useEffect per evitare accesso sincrono
  useEffect(() => {
    if (params?.id) {
      setGpId({ id: params.id });
    }
  }, [params]);
  
  // Renderizziamo il componente interno solo quando gpId è disponibile
  if (!gpId) {
    return (
      <div className="container py-10">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return <ResultsContent gpId={gpId} />;
}

