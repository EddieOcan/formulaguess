"use client"

import React, { use } from "react"
import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Database } from "@/lib/database.types"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle2, PlusCircle, Pencil } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type GrandPrix = Database["public"]["Tables"]["grand_prix"]["Row"]
type Event = Database["public"]["Tables"]["events"]["Row"]
type Driver = Database["public"]["Tables"]["drivers"]["Row"]
type Prediction = Database["public"]["Tables"]["predictions"]["Row"]

// Mappa dei colori dei team F1
const teamColors: Record<string, { primary: string; secondary: string; lighter: string }> = {
  Ferrari: { primary: "bg-[#F91536]/80", secondary: "text-black", lighter: "bg-[#F91536]/60" },
  Mercedes: { primary: "bg-[#00D2BE]/80", secondary: "text-black", lighter: "bg-[#00D2BE]/60" },
  "Red Bull Racing": { primary: "bg-[#0600EF]/80", secondary: "text-black", lighter: "bg-[#0600EF]/60" },
  McLaren: { primary: "bg-[#FF8700]/80", secondary: "text-black", lighter: "bg-[#FF8700]/60" },
  Alpine: { primary: "bg-[#0090FF]/80", secondary: "text-black", lighter: "bg-[#0090FF]/60" },
  AlphaTauri: { primary: "bg-[#2B4562]/80", secondary: "text-black", lighter: "bg-[#2B4562]/60" },
  "Aston Martin": { primary: "bg-[#006F62]/80", secondary: "text-black", lighter: "bg-[#006F62]/60" },
  Williams: { primary: "bg-[#005AFF]/80", secondary: "text-black", lighter: "bg-[#005AFF]/60" },
  "Alfa Romeo": { primary: "bg-[#900000]/80", secondary: "text-black", lighter: "bg-[#900000]/60" },
  "Haas F1 Team": { primary: "bg-[#FFFFFF]/80", secondary: "text-black", lighter: "bg-[#FFFFFF]/60" },
  // Fallback per piloti senza team o team non mappati
  default: { primary: "bg-gray-200", secondary: "text-black", lighter: "bg-gray-100" }
}

// Componente per la card del pilota selezionato
const DriverCard = ({ driver }: { driver: Driver }) => {
  const teamColor = teamColors[driver.team] || { primary: "bg-gray-200", secondary: "text-black", lighter: "bg-gray-100" }

  // Costruisci il percorso dell'immagine del pilota
  const driverImagePath = `/drivers/${driver.name.toLowerCase().replace(/\s+/g, "-")}.png`

  return (
    <div className={cn("w-full shadow-md overflow-hidden", teamColor.lighter)}>
      <div className="relative p-4">
        <div className="relative flex flex-col items-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white mb-3 bg-white">
            <Image
              src={driverImagePath || "/placeholder.svg"}
              alt={driver.name}
              width={96}
              height={96}
              className="object-cover"
              onError={(e) => {
                // Fallback se l'immagine non esiste
                e.currentTarget.src = "/placeholder.svg?height=96&width=96"
              }}
            />
          </div>
          <div className="text-center">
            <h3 className={cn("text-lg font-bold", teamColor.secondary)}>{driver.name}</h3>
            <span className="inline-block bg-black/10 text-black text-xs px-3 py-1 rounded-full mt-2 backdrop-blur-sm">
              {driver.team}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrapper component to handle params
function PredictionsContent({ gpId }: { gpId: { id: string } }) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [grandPrix, setGrandPrix] = useState<GrandPrix | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [predictions, setPredictions] = useState<Record<string, string>>({})
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [selectedDrivers, setSelectedDrivers] = useState<Record<string, Driver | null>>({})

  useEffect(() => {
    if (!gpId.id) return; // Non procedere se id non è ancora disponibile
    
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/login")
        } else {
          setUserId(user.id)
          fetchData(user.id)
        }
      } catch (error) {
        console.error("Errore nel controllo dell'utente:", error)
        router.push("/login")
      }
    }

    checkUser()
  }, [supabase, router, gpId.id])

  useEffect(() => {
    if (grandPrix) {
      const interval = setInterval(() => {
        const now = new Date()
        const end = new Date(grandPrix.end_date)

        if (!end || isNaN(end.getTime())) {
          setTimeRemaining("Data non valida");
          clearInterval(interval);
          return;
        }

        const diff = end.getTime() - now.getTime()
        if (diff <= 0) {
          setTimeRemaining("Tempo scaduto")
          clearInterval(interval)
          return
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        setTimeRemaining(`${days}g ${hours}h ${minutes}m`)
      }, 60000)

      // Calcola il tempo rimanente iniziale
      const now = new Date()
      const end = new Date(grandPrix.end_date)
      
      if (!end || isNaN(end.getTime())) {
        setTimeRemaining("Data non valida");
        return () => clearInterval(interval);
      }
      
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining("Tempo scaduto")
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        setTimeRemaining(`${days}g ${hours}h ${minutes}m`)
      }

      return () => clearInterval(interval)
    }
  }, [grandPrix])

  const fetchData = async (userId: string) => {
    setLoading(true)
    try {
      // Ottieni il Gran Premio
      const { data: gp, error: gpError } = await supabase.from("grand_prix").select("*").eq("id", gpId.id).single()

      if (gpError) throw gpError
      setGrandPrix(gp)

      // Verifica se il Gran Premio è attivo
      if (gp.status !== "active") {
        toast({
          title: "Gran Premio non attivo",
          description: "Non è possibile fare previsioni per questo Gran Premio",
          variant: "destructive",
        })
        router.push("/dashboard")
        return
      }

      // Ottieni gli eventi del Gran Premio
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("grand_prix_id", gpId.id)
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

      // Ottieni le previsioni esistenti dell'utente
      const { data: predictionsData, error: predictionsError } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", userId)
        .in("event_id", eventsData?.map((e) => e.id) || [])

      if (predictionsError) throw predictionsError

      // Salva le previsioni nell'array
      setUserPredictions(predictionsData || []);

      // Converti le previsioni in un oggetto per un accesso più facile
      const predictionsObj: Record<string, string> = {}
      const selectedDriversObj: Record<string, Driver | null> = {}

      predictionsData?.forEach((pred: Prediction) => {
        predictionsObj[pred.event_id] = pred.prediction

        // Trova il driver corrispondente alla previsione
        const matchingDriver = driversData?.find((d) => d.name === pred.prediction) || null
        selectedDriversObj[pred.event_id] = matchingDriver
      })

      setPredictions(predictionsObj)
      setSelectedDrivers(selectedDriversObj)
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

  const handlePredictionChange = (eventId: string, value: string) => {
    setPredictions((prev) => ({
      ...prev,
      [eventId]: value,
    }))

    // Trova il driver selezionato
    const selectedDriver = drivers.find((d) => d.name === value) || null
    setSelectedDrivers((prev) => ({
      ...prev,
      [eventId]: selectedDriver,
    }))
  }

  const savePredictions = async () => {
    if (!userId) return

    setSaving(true)
    try {
      // Per ogni evento, inserisci o aggiorna la previsione
      for (const eventId in predictions) {
        if (!predictions[eventId]) continue

        const { error } = await supabase.from("predictions").upsert(
          {
            user_id: userId,
            event_id: eventId,
            prediction: predictions[eventId],
          },
          {
            onConflict: "user_id,event_id",
          },
        )

        if (error) throw error
      }

      toast({
        title: "Previsioni salvate",
        description: "Le tue previsioni sono state salvate con successo",
      })
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante il salvataggio delle previsioni",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
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
      <h1 className="text-3xl font-bold mb-2 text-center">
        <span className="bg-gradient-to-r from-[#FF1801] to-[#E10600] text-transparent bg-clip-text">
          {grandPrix?.name}
        </span>
      </h1>
      <p className="text-muted-foreground mb-6 text-center">Tempo rimanente: <span className="font-semibold">{timeRemaining}</span></p>

      <Alert className="mb-6 bg-[#FF1801]/10 border-[#FF1801]/20 text-[#FF1801]">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Puoi modificare le tue previsioni fino alla fine del Gran Premio. Assicurati di salvare le modifiche.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {events.map((event, i) => (
          <Card key={i} className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
            <div className="h-1 w-full bg-[#FF1801]"></div>
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">{event.name}</CardTitle>
                  <CardDescription className="flex items-center">
                    <span className="mr-2">{event.description}</span> • 
                    <Badge className="ml-2 bg-[#FF1801] text-white border-none">
                      {event.points} {event.points === 1 ? "punto" : "punti"}
                    </Badge>
                  </CardDescription>
                </div>
                
                {selectedDrivers[event.id] && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2 bg-white/90 hover:bg-white text-black/80 font-medium border border-gray-200"
                    onClick={() => {
                      // Reset della selezione per permettere una nuova scelta
                      setSelectedDrivers(prev => ({
                        ...prev,
                        [event.id]: null
                      }));
                      setPredictions(prev => ({
                        ...prev,
                        [event.id]: ""
                      }));
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Modifica
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {selectedDrivers[event.id] ? (
                <div>
                  <div className={cn("p-4 flex flex-col", teamColors[selectedDrivers[event.id]!.team].primary)}>
                    <div className="flex items-center justify-between">
                      <div className={teamColors[selectedDrivers[event.id]!.team].secondary}>
                        <div className="text-xs font-semibold opacity-80">Previsione selezionata</div>
                        <div className="font-bold text-lg">{selectedDrivers[event.id]!.name}</div>
                      </div>
                      <CheckCircle2 className={cn("h-5 w-5", teamColors[selectedDrivers[event.id]!.team].secondary)} />
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <DriverCard driver={selectedDrivers[event.id]!} />
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <Select
                    value={predictions[event.id] || ""}
                    onValueChange={(value) => handlePredictionChange(event.id, value)}
                  >
                    <SelectTrigger className="w-full rounded-lg border-gray-300 dark:border-gray-700">
                      <SelectValue placeholder="Seleziona un pilota" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => {
                        const teamColor = teamColors[driver.team] || { primary: "bg-gray-200", secondary: "text-black" }
                        return (
                          <SelectItem key={driver.id} value={driver.name} className="flex items-center">
                            <div className="flex items-center w-full">
                              <span className={cn("w-3 h-3 rounded-full mr-2", teamColor.primary)} />
                              {driver.name} ({driver.team})
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-center gap-4 mt-8">
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard")}
            className="rounded-full border-gray-300 dark:border-gray-700 px-6"
          >
            Annulla
          </Button>
          <Button 
            onClick={savePredictions} 
            disabled={saving}
            className="rounded-full bg-[#FF1801] hover:bg-[#E10600] text-white border-none px-6 shadow-md"
          >
            {saving ? "Salvataggio..." : "Salva previsioni"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Componente principale che estrae l'ID e passa al componente interno
export default function PredictionsPage({ params }: { params: { id: string } }) {
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
  
  return <PredictionsContent gpId={gpId} />;
}

