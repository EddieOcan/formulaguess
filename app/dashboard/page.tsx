"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Database } from "@/lib/database.types"
import Link from "next/link"
import { Trophy, Calendar, AlertTriangle, ChevronRight, Flag, Clock, CheckCircle2, PlusCircle, CircleOff, AlertCircle, Pencil } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import ReactCountryFlag from "react-country-flag"
import { useToast } from "@/components/ui/use-toast"

// Mappa dei colori dei team F1 per le card delle previsioni
const teamColors: Record<string, { primary: string; secondary: string; lighter: string; gradient: string }> = {
  Ferrari: { primary: "bg-[#e10600]/80", secondary: "text-white", lighter: "bg-[#e10600]/10", gradient: "linear-gradient(135deg, #e10600 0%, #990000 100%)" },
  Mercedes: { primary: "bg-[#00D2BE]/80", secondary: "text-white", lighter: "bg-[#00D2BE]/10", gradient: "linear-gradient(135deg, #00D2BE 0%, #007A71 100%)" },
  "Red Bull Racing": { primary: "bg-[#0600EF]/80", secondary: "text-white", lighter: "bg-[#0600EF]/10", gradient: "linear-gradient(135deg, #0600EF 0%, #000066 100%)" },
  McLaren: { primary: "bg-[#FF8700]/80", secondary: "text-white", lighter: "bg-[#FF8700]/10", gradient: "linear-gradient(135deg, #FF8700 0%, #FF5500 100%)" },
  Alpine: { primary: "bg-[#0090FF]/80", secondary: "text-white", lighter: "bg-[#0090FF]/10", gradient: "linear-gradient(135deg, #0090FF 0%, #0050AA 100%)" },
  AlphaTauri: { primary: "bg-[#2B4562]/80", secondary: "text-white", lighter: "bg-[#2B4562]/10", gradient: "linear-gradient(135deg, #2B4562 0%, #1A2A3C 100%)" },
  "Aston Martin": { primary: "bg-[#006F62]/80", secondary: "text-white", lighter: "bg-[#006F62]/10", gradient: "linear-gradient(135deg, #006F62 0%, #004C42 100%)" },
  Williams: { primary: "bg-[#005AFF]/80", secondary: "text-white", lighter: "bg-[#005AFF]/10", gradient: "linear-gradient(135deg, #005AFF 0%, #0030AA 100%)" },
  "Alfa Romeo": { primary: "bg-[#900000]/80", secondary: "text-white", lighter: "bg-[#900000]/10", gradient: "linear-gradient(135deg, #900000 0%, #500000 100%)" },
  "Haas F1 Team": { primary: "bg-[#FFFFFF]/80", secondary: "text-black", lighter: "bg-[#FFFFFF]/60", gradient: "linear-gradient(135deg, #FFFFFF 0%, #CCCCCC 100%)" },
  // Fallback per piloti senza team o team non mappati
  default: { primary: "bg-gray-200", secondary: "text-black", lighter: "bg-gray-100", gradient: "linear-gradient(135deg, #E0E0E0 0%, #BBBBBB 100%)" }
}

// Funzione per ottenere il colore del team dal nome del pilota
const getDriverTeamColor = (driverName: string) => {
  // Mappa semplificata dei piloti ai loro team (in produzione useresti un database)
  const driverTeamMap: Record<string, string> = {
    "Max Verstappen": "Red Bull Racing",
    "Sergio Perez": "Red Bull Racing",
    "Lewis Hamilton": "Mercedes",
    "George Russell": "Mercedes",
    "Charles Leclerc": "Ferrari",
    "Carlos Sainz": "Ferrari",
    "Lando Norris": "McLaren",
    "Oscar Piastri": "McLaren",
    "Fernando Alonso": "Aston Martin",
    "Lance Stroll": "Aston Martin",
    "Pierre Gasly": "Alpine",
    "Esteban Ocon": "Alpine",
    "Alexander Albon": "Williams",
    "Logan Sargeant": "Williams",
    "Yuki Tsunoda": "AlphaTauri",
    "Daniel Ricciardo": "AlphaTauri",
    "Valtteri Bottas": "Alfa Romeo",
    "Zhou Guanyu": "Alfa Romeo",
    "Kevin Magnussen": "Haas F1 Team",
    "Nico Hulkenberg": "Haas F1 Team",
    // Aggiungi altri piloti se necessario
  }
  
  const team = driverTeamMap[driverName] || "default"
  return teamColors[team] || teamColors.default
}

// Componente per la card del pilota selezionato
const DriverCard = ({ driverName }: { driverName: string }) => {
  const driverColor = getDriverTeamColor(driverName);
  const driverTeamMap: Record<string, string> = {
    "Max Verstappen": "Red Bull Racing",
    "Sergio Perez": "Red Bull Racing",
    "Lewis Hamilton": "Mercedes",
    "George Russell": "Mercedes",
    "Charles Leclerc": "Ferrari",
    "Carlos Sainz": "Ferrari",
    "Lando Norris": "McLaren",
    "Oscar Piastri": "McLaren",
    "Fernando Alonso": "Aston Martin",
    "Lance Stroll": "Aston Martin",
    "Pierre Gasly": "Alpine",
    "Esteban Ocon": "Alpine",
    "Alexander Albon": "Williams",
    "Logan Sargeant": "Williams",
    "Yuki Tsunoda": "AlphaTauri",
    "Daniel Ricciardo": "AlphaTauri",
    "Valtteri Bottas": "Alfa Romeo",
    "Zhou Guanyu": "Alfa Romeo",
    "Kevin Magnussen": "Haas F1 Team",
    "Nico Hulkenberg": "Haas F1 Team",
    // Aggiungi altri piloti se necessario
  }
  
  const team = driverTeamMap[driverName] || "default";
  
  // Costruisci il percorso dell'immagine del pilota
  const driverImagePath = `/drivers/${driverName.toLowerCase().replace(/\s+/g, "-")}.png`;

  return (
    <div className="card-modern pulse-on-hover">
      <div className={cn("h-1.5 w-full", driverColor.primary)} />
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-white">
            <Image
              src={driverImagePath}
              alt={driverName}
              width={48}
              height={48}
              className="object-cover"
              onError={(e) => {
                // Fallback se l'immagine non esiste
                e.currentTarget.src = "/placeholder.svg?height=48&width=48";
              }}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold">{driverName}</h3>
            <span className="inline-block text-xs text-gray-500 dark:text-gray-400">
              {team}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Definizione dell'interfaccia Driver
interface Driver {
  name: string;
  team: string;
}

// Array di piloti per l'applicazione
const drivers: Driver[] = [
  { name: "Max Verstappen", team: "Red Bull Racing" },
  { name: "Sergio Perez", team: "Red Bull Racing" },
  { name: "Lewis Hamilton", team: "Mercedes" },
  { name: "George Russell", team: "Mercedes" },
  { name: "Charles Leclerc", team: "Ferrari" },
  { name: "Carlos Sainz", team: "Ferrari" },
  { name: "Lando Norris", team: "McLaren" },
  { name: "Oscar Piastri", team: "McLaren" },
  { name: "Fernando Alonso", team: "Aston Martin" },
  { name: "Lance Stroll", team: "Aston Martin" },
  { name: "Pierre Gasly", team: "Alpine" },
  { name: "Esteban Ocon", team: "Alpine" },
  { name: "Alexander Albon", team: "Williams" },
  { name: "Logan Sargeant", team: "Williams" },
  { name: "Yuki Tsunoda", team: "AlphaTauri" },
  { name: "Daniel Ricciardo", team: "AlphaTauri" },
  { name: "Valtteri Bottas", team: "Alfa Romeo" },
  { name: "Zhou Guanyu", team: "Alfa Romeo" },
  { name: "Kevin Magnussen", team: "Haas F1 Team" },
  { name: "Nico Hulkenberg", team: "Haas F1 Team" }
];

type GrandPrix = Database["public"]["Tables"]["grand_prix"]["Row"] & {
  image_url?: string | null;
  location?: string | null;
  country_code?: string | null;
}

type Prediction = Database["public"]["Tables"]["predictions"]["Row"] & {
  events: Database["public"]["Tables"]["events"]["Row"];
  score?: number;
  driver_id?: string;
}

type Leaderboard = Database["public"]["Tables"]["leaderboards"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"]
}

export default function Dashboard() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeGrandPrix, setActiveGrandPrix] = useState<GrandPrix | null>(null)
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [userScore, setUserScore] = useState<number>(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
      } else {
        fetchDashboardData(user.id)
        
        // Controlla se l'utente è un amministratore
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
          
        if (profile && profile.role === "admin") {
          setIsAdmin(true)
        }
      }
    }

    checkUser()
  }, [supabase, router])

  const fetchDashboardData = async (userId: string) => {
    setLoading(true)
    try {
      // Aggiorna lo stato dei Gran Premi
      await supabase.rpc("run_update_grand_prix_status")

      // Ottieni il Gran Premio attivo
      const { data: activeGP } = await supabase
        .from("grand_prix")
        .select("*")
        .eq("status", "active")
        .order("start_date", { ascending: true })
        .limit(1)
        .single()

      setActiveGrandPrix(activeGP || null)

      // Ottieni le previsioni dell'utente per il Gran Premio attivo
      if (activeGP) {
        const { data: predictions } = await supabase
          .from("predictions")
          .select(`
            *,
            events(*)
          `)
          .eq("user_id", userId)
          .in(
            "event_id",
            (await supabase.from("events").select("id").eq("grand_prix_id", activeGP.id)).data?.map((e) => e.id) || [],
          )

        setUserPredictions((predictions as Prediction[]) || [])
      }

      // Ottieni il punteggio totale dell'utente
      const { data: profile } = await supabase.from("profiles").select("total_score").eq("id", userId).single()

      if (profile) {
        setUserScore(profile.total_score || 0)
      }

      // Ottieni la posizione dell'utente nella classifica generale
      const { data: leaderboard, count } = await supabase
        .from("profiles")
        .select("id, total_score", { count: "exact" })
        .order("total_score", { ascending: false })

      if (leaderboard) {
        setTotalUsers(count || 0)
        const userPosition = leaderboard.findIndex((item) => item.id === userId) + 1
        setUserRank(userPosition)
      }
    } catch (error) {
      console.error("Errore nel caricamento dei dati:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="main-container">
        <div className="space-y-8">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-12 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="main-container">
      <h1 className="section-title mb-8">Dashboard</h1>
      
      {/* Card di riepilogo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="h-1.5 w-full bg-[#e10600]"></div>
          <div className="p-6">
            <div className="flex items-center text-[#e10600] mb-3">
              <Trophy className="h-5 w-5 mr-2" />
              <h3 className="font-medium">Posizione in classifica</h3>
            </div>
            
            <div className="mt-4 mb-3">
              <div className="flex flex-col">
                <div className="text-3xl font-bold">
                  {userRank !== null ? `${userRank}°` : "-"}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {totalUsers > 0 ? `su ${totalUsers} partecipanti` : ""}
                </div>
              </div>
            </div>
            
            <Link 
              href="/leaderboard"
              className="text-xs flex items-center text-[#e10600] font-medium hover:underline mt-2"
            >
              Vedi classifica completa
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </Card>

        <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="h-1.5 w-full bg-[#e10600]"></div>
          <div className="p-6">
            <div className="flex items-center text-[#e10600] mb-3">
              <Flag className="h-5 w-5 mr-2" />
              <h3 className="font-medium">Punteggio totale</h3>
            </div>
            
            <div className="mt-4 mb-3">
              <div className="flex flex-col">
                <div className="text-3xl font-bold">
                  {userScore}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Punti guadagnati nelle previsioni
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="h-1.5 w-full bg-[#e10600]"></div>
          <div className="p-6">
            <div className="flex items-center text-[#e10600] mb-3">
              <Calendar className="h-5 w-5 mr-2" />
              <h3 className="font-medium">Prossimo Gran Premio</h3>
            </div>
            
            {activeGrandPrix ? (
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  {activeGrandPrix.country_code && (
                    <div className="flex-shrink-0">
                      <ReactCountryFlag 
                        countryCode={activeGrandPrix.country_code} 
                        svg 
                        style={{
                          width: '2.5em',
                          height: '2.5em',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        title={activeGrandPrix.country_code}
                      />
                    </div>
                  )}
                  <div>
                    <div className="text-xl font-bold">
                      {activeGrandPrix.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(activeGrandPrix.start_date).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                
                {activeGrandPrix.location && (
                  <div className="flex items-center text-sm text-gray-500 mt-3">
                    <Flag className="h-4 w-4 mr-2" />
                    {activeGrandPrix.location}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xl font-bold mt-4">
                Nessun Gran Premio attivo
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-10">
        {/* Sezione Gran Premio attivo e previsioni */}
        <div>
          <Tabs defaultValue="upcoming" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Gran Premi e Previsioni</h2>
              <TabsList className="bg-gray-100 dark:bg-gray-800 rounded">
                <TabsTrigger value="upcoming" className="rounded text-sm">Prossimi</TabsTrigger>
                <TabsTrigger value="history" className="rounded text-sm">Storico</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="upcoming" className="mt-0">
              <UpcomingGrandPrix userPredictions={userPredictions} />
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <PredictionHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function UpcomingGrandPrix({ userPredictions }: { userPredictions: Prediction[] }) {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [grandPrix, setGrandPrix] = useState<GrandPrix[]>([])
  const [userDriverPredictions, setUserDriverPredictions] = useState<Record<string, any[]>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await supabase
          .from("grand_prix")
          .select("*")
          .in("status", ["active", "upcoming"])
          .order("start_date", { ascending: true })
          .limit(3)

        setGrandPrix(data || [])

        // Carica le informazioni dettagliate sulle previsioni fatte
        if (userPredictions.length > 0) {
          const predictionsByGrandPrix: Record<string, any[]> = {}
          
          for (const prediction of userPredictions) {
            const eventId = prediction.event_id
            
            // Ottieni i dettagli del driver selezionato
            if (prediction.driver_id) {
              const { data: driverData } = await supabase
                .from("drivers")
                .select("*")
                .eq("id", prediction.driver_id)
                .single()
                
              if (!predictionsByGrandPrix[prediction.events.grand_prix_id]) {
                predictionsByGrandPrix[prediction.events.grand_prix_id] = []
              }
              
              predictionsByGrandPrix[prediction.events.grand_prix_id].push({
                ...prediction,
                driver: driverData
              })
            }
          }
          
          setUserDriverPredictions(predictionsByGrandPrix)
        }
      } catch (error) {
        console.error("Errore nel caricamento dei Gran Premi:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, userPredictions])

  const getTimeRemaining = (date: string) => {
    const now = new Date()
    const endDate = new Date(date)
    
    const diff = endDate.getTime() - now.getTime()
    if (diff <= 0) return "Previsioni chiuse"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    return `${days}g ${hours}h rimanenti`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (grandPrix.length === 0) {
    return (
      <Card className="rounded-lg border bg-white dark:bg-neutral-900 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg font-medium">Nessun Gran Premio in programma</p>
          <p className="text-muted-foreground mt-1">Non ci sono Gran Premi attivi o in programma al momento.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {grandPrix.map((gp) => {
        const isPredictionsMade = userPredictions.length > 0 && gp.status === "active"
        const timeRemaining = getTimeRemaining(gp.end_date)
        const isPredictionsClosed = timeRemaining === "Previsioni chiuse"
        const gpPredictions = userDriverPredictions[gp.id] || []

        return (
          <Card 
            key={gp.id} 
            className={cn(
              "rounded-xl border shadow overflow-hidden",
              gp.status === "active" ? "border-[#e10600] border-2" : "border-gray-200 dark:border-gray-800"
            )}
          >
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Header della card con data e stato */}
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 px-6 py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">
                    {new Date(gp.start_date).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <Badge 
                    className={cn(
                      "rounded-full text-xs font-medium px-3",
                      gp.status === "active" ? "bg-[#e10600] text-white" : "bg-amber-500 text-white"
                    )}
                  >
                    {gp.status === "active" ? "Attivo" : "In programma"}
                  </Badge>
                </div>
                
                {/* Contenuto principale */}
                <div className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      {/* Nome GP e bandiera */}
                      <div className="flex items-center gap-3">
                        {gp.country_code && (
                          <div className="flex-shrink-0">
                            <ReactCountryFlag 
                              countryCode={gp.country_code} 
                              svg 
                              style={{
                                width: '2.5em',
                                height: '2.5em',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                              title={gp.country_code}
                            />
                          </div>
                        )}
                        <h3 className="text-2xl font-medium">{gp.name}</h3>
                      </div>
                      
                      {/* Location */}
                      {gp.location && (
                        <p className="text-sm text-gray-500 flex items-center">
                          <Flag className="h-4 w-4 mr-2" />
                          {gp.location}
                        </p>
                      )}
                      
                      {/* Tempo rimanente */}
                      {gp.status === "active" && (
                        <div className="inline-flex items-center mt-2 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg text-sm text-amber-800 dark:text-amber-400">
                          <Clock className="h-4 w-4 mr-2" />
                          {timeRemaining}
                        </div>
                      )}
                    </div>
                    
                    {/* Azioni */}
                    <div className="flex-shrink-0">
                      {gp.status === "active" ? (
                        <>
                          {isPredictionsMade ? (
                            <div className="flex flex-col items-end space-y-3">
                              <div className="flex items-center text-green-600 text-sm bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg">
                                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                <span>Previsioni effettuate</span>
                              </div>
                              <Button variant="outline" className="rounded-lg border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 px-4 h-10" asChild>
                                <Link href={`/predictions/${gp.id}`}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Vedi previsione
                                </Link>
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              className="rounded-lg bg-[#e10600] hover:bg-[#c00000] text-white px-4 h-10"
                              disabled={isPredictionsClosed}
                              asChild
                            >
                              <Link href={`/predictions/${gp.id}`}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Fai le tue previsioni
                              </Link>
                            </Button>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-end space-y-3">
                          <div className="flex items-center text-gray-500 text-sm bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                            <Clock className="h-4 w-4 mr-1.5" />
                            <span>In attesa di attivazione</span>
                          </div>
                          <Button variant="outline" className="rounded-lg px-4 h-10" disabled>
                            <CircleOff className="h-4 w-4 mr-2" />
                            Previsioni non disponibili
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Mostra le previsioni fatte per il GP attivo */}
                {gp.status === "active" && gpPredictions.length > 0 && (
                  <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <h4 className="text-sm font-medium mb-3">Le tue previsioni:</h4>
                    <div className="flex flex-wrap gap-3">
                      {gpPredictions.map((prediction) => (
                        <div key={prediction.id} className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-white">
                            <Image
                              src={`/drivers/${prediction.driver?.name.toLowerCase().replace(/\s+/g, "-")}.png`}
                              alt={prediction.driver?.name || "Pilota"}
                              width={32}
                              height={32}
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg?height=32&width=32";
                              }}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {prediction.driver?.name}
                            </span>
                            <Badge className="mt-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-[10px] px-1.5 py-0.5 h-4">
                              {prediction.events.event_type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function PredictionHistory() {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) return

        // Ottieni i Gran Premi completati
        const { data: completedGP } = await supabase
          .from("grand_prix")
          .select("*")
          .eq("status", "completed")
          .order("end_date", { ascending: false })
          .limit(5)

        if (!completedGP || completedGP.length === 0) {
          setHistory([])
          setLoading(false)
          return
        }

        // Per ogni Gran Premio, ottieni le previsioni dell'utente
        const historyWithPredictions = await Promise.all(
          completedGP.map(async (gp) => {
            // Ottieni gli eventi di questo Gran Premio
            const { data: events } = await supabase
              .from("events")
              .select("*")
              .eq("grand_prix_id", gp.id)

            // Ottieni le previsioni dell'utente per questi eventi
            const { data: predictions } = await supabase
              .from("predictions")
              .select(`
                *,
                events(*)
              `)
              .eq("user_id", user.user.id)
              .in("event_id", events?.map((e) => e.id) || [])

            // Calcola il punteggio totale basato sui punti degli eventi
            // Poiché 'score' potrebbe non esistere nella tabella predictions,
            // usiamo i punti dagli eventi come alternativa
            const totalScore = predictions?.reduce((sum, pred) => {
              // Aggiungiamo i punti dell'evento per ogni previsione
              return sum + (pred.events?.points || 0);
            }, 0) || 0

            return {
              ...gp,
              predictions: predictions || [],
              totalScore,
              predictionCount: predictions?.length || 0,
              eventCount: events?.length || 0,
            }
          }),
        )

        setHistory(historyWithPredictions)
      } catch (error) {
        console.error("Errore nel caricamento della cronologia:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <Card className="card-modern">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg font-semibold">Nessuna previsione passata</p>
          <p className="text-muted-foreground mt-1">Non hai ancora effettuato previsioni per nessun Gran Premio completato.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <Card key={item.id} className="card-modern">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Badge variant="outline">Completato</Badge>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.end_date).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold">{item.name}</h3>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1.5 text-[var(--f1-red)]" />
                    <span className="text-sm font-medium">{item.totalScore} punti</span>
                  </div>
                  
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {item.predictionCount}/{item.eventCount} previsioni
                    </span>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="rounded-lg" asChild>
                <Link href={`/results/${item.id}`}>
                  Visualizza risultati
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

