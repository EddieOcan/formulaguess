"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Database } from "@/lib/database.types"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, ArrowLeft, CheckCircle, XCircle, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type GrandPrix = Database["public"]["Tables"]["grand_prix"]["Row"]
type Event = Database["public"]["Tables"]["events"]["Row"]
type Result = Database["public"]["Tables"]["results"]["Row"]
type Prediction = Database["public"]["Tables"]["predictions"]["Row"]

interface EventWithResult {
  id: string
  name: string
  description: string | null
  points: number
  actual_result: string | null
  user_prediction: string | null
  is_correct: boolean | null
}

// Componente interno che gestisce la logica
function ResultsContent({ gpId }: { gpId: { id: string } }) {
  const [id, setId] = useState<string>("");
  const { supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [grandPrix, setGrandPrix] = useState<GrandPrix | null>(null)
  const [events, setEvents] = useState<EventWithResult[]>([])
  const [results, setResults] = useState<Record<string, Result>>({})
  const [userPredictions, setUserPredictions] = useState<Record<string, string>>({})
  const [totalScore, setTotalScore] = useState<number>(0)

  useEffect(() => {
    // Estrai l'ID in modo sicuro all'interno dell'useEffect
    setId(gpId?.id || "");
  }, [gpId]);

  useEffect(() => {
    if (!id) return; // Skip if id is not yet available
    
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
      } else {
        fetchData(user.id)
      }
    }

    checkUser()
  }, [supabase, router, id])

  const fetchData = async (userId: string) => {
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

      // Ottieni i risultati degli eventi
      const { data: resultsData, error: resultsError } = await supabase
        .from("results")
        .select("*")
        .in("event_id", eventsData?.map((e) => e.id) || [])

      if (resultsError) throw resultsError

      // Ottieni le previsioni dell'utente
      const { data: predictionsData, error: predictionsError } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", userId)
        .in("event_id", eventsData?.map((e) => e.id) || [])

      if (predictionsError) throw predictionsError

      // Ottieni il punteggio dell'utente per questo Gran Premio
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from("leaderboards")
        .select("score")
        .eq("grand_prix_id", id)
        .eq("user_id", userId)
        .single()

      if (leaderboardData) {
        setTotalScore(leaderboardData.score)
      }

      // Combina eventi, risultati e previsioni
      const eventsWithResults: EventWithResult[] = eventsData.map((event) => {
        const result = resultsData?.find((r) => r.event_id === event.id)
        const prediction = predictionsData?.find((p) => p.event_id === event.id)
        const isCorrect = result && prediction ? result.actual_result === prediction.prediction : null

        return {
          ...event,
          actual_result: result?.actual_result || null,
          user_prediction: prediction?.prediction || null,
          is_correct: isCorrect,
        }
      })

      setEvents(eventsWithResults)
    } catch (error) {
      console.error("Errore nel caricamento dei dati:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold f1-heading">Risultati: {grandPrix?.name}</h1>
          <p className="text-muted-foreground flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date(grandPrix?.start_date || "").toLocaleDateString("it-IT")} -{" "}
            {new Date(grandPrix?.end_date || "").toLocaleDateString("it-IT")}
          </p>
        </div>
        <Badge variant={grandPrix?.status === "completed" ? "secondary" : "default"} className="f1-badge">
          {grandPrix?.status === "completed" ? "COMPLETATO" : "ATTIVO"}
        </Badge>
      </div>

      {totalScore !== 0 && (
        <Card className="mb-6 f1-card f1-card-success">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-success/10 p-3 rounded-full mr-4">
                  <Trophy className="h-8 w-8 text-success" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Il tuo punteggio</h3>
                  <p className="text-muted-foreground">Per questo Gran Premio</p>
                </div>
              </div>
              <div className="text-3xl font-bold">{totalScore} punti</div>
            </div>
          </CardContent>
        </Card>
      )}

      {events.length === 0 ? (
        <Card className="f1-card">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Nessun risultato disponibile per questo Gran Premio</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className={cn(
                "f1-card",
                event.is_correct === true ? "f1-card-success" : event.is_correct === false ? "f1-card" : "",
              )}
            >
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
                <CardDescription>
                  {event.description || "Nessuna descrizione"} • Vale {event.points}{" "}
                  {event.points === 1 ? "punto" : "punti"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">La tua previsione:</p>
                    <div className="p-3 rounded-md bg-muted/50 border border-border">
                      {event.user_prediction ? (
                        <p className="font-medium">{event.user_prediction}</p>
                      ) : (
                        <p className="text-muted-foreground">Nessuna previsione</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Risultato effettivo:</p>
                    <div className="p-3 rounded-md bg-muted/50 border border-border">
                      {event.actual_result ? (
                        <p className="font-medium">{event.actual_result}</p>
                      ) : (
                        <p className="text-muted-foreground">Risultato non ancora disponibile</p>
                      )}
                    </div>
                  </div>
                </div>
                {event.is_correct !== null && (
                  <div className="mt-4">
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Esito:</p>
                      {event.is_correct ? (
                        <Badge
                          variant="default"
                          className="bg-success text-success-foreground flex items-center f1-badge"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          CORRETTO (+{event.points} punti)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-destructive flex items-center f1-badge">
                          <XCircle className="mr-1 h-4 w-4" />
                          ERRATO (0 punti)
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="f1-button">
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna alla Dashboard
        </Button>
      </div>
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

