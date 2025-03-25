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
import { AlertCircle, CheckCircle2, PlusCircle, Pencil, Clock, Check, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import ReactCountryFlag from "react-country-flag"

type GrandPrix = Database["public"]["Tables"]["grand_prix"]["Row"] & {
  image_url?: string;
  location?: string;
  country_code?: string;
}
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
    <div className={cn("flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800")}>
      <div className="flex items-center">
        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700 bg-white mr-3">
          <Image
            src={driverImagePath || "/placeholder.svg"}
            alt={driver.name}
            width={48}
            height={48}
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=48&width=48"
            }}
          />
        </div>
        <div>
          <h3 className="text-sm font-medium">{driver.name}</h3>
          <div className="flex items-center mt-0.5">
            <span className={cn("w-2 h-2 rounded-full mr-1", teamColor.primary)} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{driver.team}</span>
          </div>
        </div>
      </div>
      <div className={cn("px-2 py-1 rounded text-xs font-medium", teamColor.primary, teamColor.secondary)}>
        Selezionato
      </div>
    </div>
  )
}

// Componente per la notifica di conferma
const ConfirmationOverlay = ({ 
  isVisible, 
  message, 
  onClose 
}: { 
  isVisible: boolean; 
  message: string; 
  onClose: () => void 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 max-w-md mx-4 border border-gray-100 dark:border-gray-800"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Salvato con successo!</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
              <Button 
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-md"
              >
                Chiudi
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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
  const [showConfirmation, setShowConfirmation] = useState(false)

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
        title: "Previsioni salvate con successo!",
        description: "Le tue previsioni sono state registrate correttamente",
        duration: 5000,
        className: "bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
      })
      
      // Mostra il messaggio di conferma a tutto schermo
      setShowConfirmation(true)
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
    <div className="container max-w-3xl mx-auto py-10 px-4">
      {/* Overlay di conferma */}
      <ConfirmationOverlay 
        isVisible={showConfirmation}
        message="Le tue previsioni sono state salvate correttamente"
        onClose={() => setShowConfirmation(false)}
      />
      
      <h1 className="text-2xl font-medium mb-2 text-center flex items-center justify-center gap-2">
        {grandPrix?.country_code && (
          <ReactCountryFlag 
            countryCode={grandPrix.country_code} 
            svg 
            style={{
              width: '1.5em',
              height: '1.5em',
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
            }}
            title={grandPrix.country_code}
          />
        )}
        Previsioni: <span className="text-[#e10600]">{grandPrix?.name}</span>
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center flex items-center justify-center">
        <Clock className="h-3.5 w-3.5 mr-1.5" />
        Tempo rimanente: <span className="font-medium ml-1">{timeRemaining}</span>
      </p>

      <Alert className="mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Scegli i piloti per ogni categoria di previsione e salva le tue scelte.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {events.map((event, i) => (
          <Card key={i} className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="h-1 w-full bg-[#e10600]"></div>
            <CardHeader className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center gap-2">
                <div>
                  <CardTitle className="text-base">{event.name}</CardTitle>
                  <CardDescription className="text-xs mt-1 flex items-center">
                    {event.description}
                    <Badge className="ml-2 text-[10px] bg-[#e10600] text-white border-none px-1.5 py-0">
                      {event.points} {event.points === 1 ? "punto" : "punti"}
                    </Badge>
                  </CardDescription>
                </div>
                
                {selectedDrivers[event.id] && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2 text-xs bg-white/90 hover:bg-white text-gray-700 font-medium border border-gray-200"
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
                    <Pencil className="h-3 w-3 mr-1" />
                    Cambia
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {selectedDrivers[event.id] ? (
                <DriverCard driver={selectedDrivers[event.id]!} />
              ) : (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Seleziona un pilota per questa previsione:</p>
                  <Select
                    value={predictions[event.id] || ""}
                    onValueChange={(value) => handlePredictionChange(event.id, value)}
                  >
                    <SelectTrigger className="w-full rounded border-gray-200 dark:border-gray-700 text-sm h-10">
                      <SelectValue placeholder="Seleziona un pilota" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => {
                        const teamColor = teamColors[driver.team] || { primary: "bg-gray-200", secondary: "text-black" }
                        return (
                          <SelectItem key={driver.id} value={driver.name} className="flex items-center text-sm py-1.5">
                            <div className="flex items-center w-full">
                              <span className={cn("w-2 h-2 rounded-full mr-2", teamColor.primary)} />
                              <span className="font-medium">{driver.name}</span>
                              <span className="ml-1.5 text-xs text-gray-500">({driver.team})</span>
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

        <div className="sticky bottom-4 flex justify-center mt-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg border border-gray-100 dark:border-gray-800 shadow-lg">
          <div className="flex w-full gap-3">
            <Button 
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-md border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              Torna indietro
            </Button>
            <Button 
              onClick={savePredictions} 
              disabled={saving}
              className="w-full rounded-md bg-[#e10600] hover:bg-[#c00000] text-white border-none shadow-sm"
            >
              {saving ? "Salvataggio..." : "Salva previsione"}
            </Button>
          </div>
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

