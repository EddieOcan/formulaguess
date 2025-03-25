"use client"

// Aggiungi questa classe personalizzata per schermi molto piccoli
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Database } from "@/lib/database.types"
import Link from "next/link"
import { Trophy, Calendar, AlertTriangle, ChevronRight, Flag, Clock, CheckCircle2, PlusCircle, CircleOff } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"

// Mappa dei colori dei team F1 per le card delle previsioni
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
    <div className={cn("w-full overflow-hidden shadow-md", driverColor.lighter)}>
      <div className="relative p-4">
        <div className="relative flex flex-col items-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white mb-3 bg-white">
            <Image
              src={driverImagePath}
              alt={driverName}
              width={96}
              height={96}
              className="object-cover"
              onError={(e) => {
                // Fallback se l'immagine non esiste
                e.currentTarget.src = "/placeholder.svg?height=96&width=96";
              }}
            />
          </div>
          <div className="text-center">
            <h3 className={cn("text-lg font-bold", driverColor.secondary)}>{driverName}</h3>
            <span className="inline-block bg-black/10 text-black text-xs px-3 py-1 rounded-full mt-2 backdrop-blur-sm">
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

type GrandPrix = Database["public"]["Tables"]["grand_prix"]["Row"]
type Prediction = Database["public"]["Tables"]["predictions"]["Row"] & {
  events: Database["public"]["Tables"]["events"]["Row"]
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

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
      } else {
        fetchDashboardData(user.id)
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
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6 f1-heading">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6 f1-heading text-center">
        <span className="bg-gradient-to-r from-[#FF1801] to-[#E10600] text-transparent bg-clip-text">Formula Guess</span>
      </h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className={cn("f1-card rounded-xl overflow-hidden border-none shadow-lg", 
          activeGrandPrix ? "bg-gradient-to-br from-[#FF1801]/10 to-[#E10600]/5" : "")}>
          <div className="h-1 w-full bg-[#FF1801]"></div>
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M 0,0 L 100,0 L 100,100 L 0,0" fill="#FF1801" />
            </svg>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl">
              <Calendar className="mr-2 h-5 w-5 text-[#FF1801]" />
              Gran Premio Attivo
            </CardTitle>
            <CardDescription>Il Gran Premio attualmente in corso</CardDescription>
          </CardHeader>
          <CardContent>
            {activeGrandPrix ? (
              <div>
                <div className="text-xl font-bold">{activeGrandPrix.name}</div>
                <p className="text-sm text-muted-foreground mt-1 flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {new Date(activeGrandPrix.start_date).toLocaleDateString("it-IT")} -{" "}
                  {new Date(activeGrandPrix.end_date).toLocaleDateString("it-IT")}
                </p>
                <div className="mt-4">
                  <Link href={`/predictions/${activeGrandPrix.id}`}>
                    <Button className="w-full bg-[#FF1801] hover:bg-[#E10600] text-white border-none rounded-full shadow-md">
                      {userPredictions.length > 0 ? "Modifica le tue previsioni" : "Fai le tue previsioni"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-center text-muted-foreground">Nessun Gran Premio attivo al momento</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="f1-card rounded-xl overflow-hidden border-none shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="h-1 w-full bg-[#FF1801]"></div>
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M 0,0 L 100,0 L 100,100 L 0,0" fill="#333" />
            </svg>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Le tue previsioni</CardTitle>
            <CardDescription>Previsioni per il Gran Premio attivo</CardDescription>
          </CardHeader>
          <CardContent>
            {userPredictions.length > 0 ? (
              <ul className="space-y-6">
                {userPredictions.slice(0, 3).map((prediction) => {
                  const driverColor = getDriverTeamColor(prediction.prediction);

                  return (
                    <li key={prediction.id} className="rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-800">
                      <div className={cn("p-3 flex items-center justify-between", driverColor.primary)}>
                        <div className={driverColor.secondary}>
                          <div className="text-xs font-semibold opacity-80">{prediction.events.name}</div>
                          <div className="font-bold text-lg">{prediction.prediction}</div>
                        </div>
                        <CheckCircle2 className={cn("h-5 w-5", driverColor.secondary)} />
                      </div>
                      <div>
                        <DriverCard driverName={prediction.prediction} />
                      </div>
                    </li>
                  );
                })}
                {userPredictions.length > 3 && (
                  <li className="text-center text-muted-foreground bg-gray-100 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                    + altre {userPredictions.length - 3} previsioni
                  </li>
                )}
              </ul>
            ) : (
              <div className="flex justify-center items-center p-8 border rounded-xl">
                <div className="text-center">
                  <CircleOff className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Non hai ancora fatto previsioni</p>
                  <Link
                    href="/predictions/new"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
                  >
                    <PlusCircle size={16} className="mr-2" />
                    <span>Crea la tua prima previsione</span>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="f1-card rounded-xl overflow-hidden border-none shadow-lg bg-gradient-to-br from-[#0070f3]/10 to-[#00b4f3]/5">
          <div className="h-1 w-full bg-[#FF1801]"></div>
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M 0,0 L 100,0 L 100,100 L 0,0" fill="#0070f3" />
            </svg>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl">
              <Trophy className="mr-2 h-5 w-5 text-[#FFD700]" />
              Punteggio Totale
            </CardTitle>
            <CardDescription>Il tuo punteggio complessivo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-4">{userScore}<span className="text-lg font-normal ml-2 text-muted-foreground">punti</span></div>
            
            {userRank !== null && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-muted-foreground">Classifica</div>
                  <div>
                    <span className="text-lg font-bold mr-1">{userRank}°</span>
                    <span className="text-sm text-muted-foreground">su {totalUsers}</span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-[#FF1801] h-2 rounded-full" 
                    style={{ width: `${Math.max(5, Math.min(100, ((totalUsers - userRank + 1) / totalUsers) * 100))}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <Tabs defaultValue="upcoming" className="w-full">
          <div className="flex justify-center mb-4">
            <TabsList className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
              <TabsTrigger
                value="upcoming"
                className="rounded-full px-4 py-2 data-[state=active]:bg-[#FF1801] data-[state=active]:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Prossimi Gran Premi</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-full px-4 py-2 data-[state=active]:bg-[#FF1801] data-[state=active]:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <Flag className="h-4 w-4" />
                  <span>Storico Previsioni</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="upcoming" className="space-y-4">
            <UpcomingGrandPrix userPredictions={userPredictions} />
          </TabsContent>
          <TabsContent value="history" className="space-y-4">
            <PredictionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function UpcomingGrandPrix({ userPredictions }: { userPredictions: Prediction[] }) {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [upcomingGPs, setUpcomingGPs] = useState<GrandPrix[]>([])
  const [predictions, setPredictions] = useState<Record<string, boolean>>({})
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Ottieni l'utente corrente
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        setUserId(user.id)

        // Ottieni i Gran Premi futuri
        const { data } = await supabase
          .from("grand_prix")
          .select("*")
          .or("status.eq.upcoming,status.eq.active")
          .order("start_date", { ascending: true })
          .limit(5)

        setUpcomingGPs(data || [])

        // Controlla se l'utente ha già fatto previsioni per ciascun Gran Premio
        if (data && data.length > 0) {
          // Ottieni tutti gli eventi per questi Gran Premi
          const { data: eventsData } = await supabase
            .from("events")
            .select("id, grand_prix_id")
            .in(
              "grand_prix_id",
              data.map((gp) => gp.id),
            )

          if (eventsData && eventsData.length > 0) {
            // Raggruppa gli eventi per Grand Prix
            const eventsByGP: Record<string, string[]> = {}
            eventsData.forEach((event) => {
              if (!eventsByGP[event.grand_prix_id]) {
                eventsByGP[event.grand_prix_id] = []
              }
              eventsByGP[event.grand_prix_id].push(event.id)
            })

            // Controlla le previsioni per ogni Gran Premio
            const predictionsByGP: Record<string, boolean> = {}

            for (const gpId in eventsByGP) {
              const { data: predictionsData, count } = await supabase
                .from("predictions")
                .select("*", { count: "exact" })
                .eq("user_id", user.id)
                .in("event_id", eventsByGP[gpId])
                .limit(1)

              predictionsByGP[gpId] = (count || 0) > 0
            }

            setPredictions(predictionsByGP)
          }
        }
      } catch (error) {
        console.error("Errore nel caricamento dei Gran Premi:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (upcomingGPs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Nessun Gran Premio in programma</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {upcomingGPs.map((gp) => (
        <Card key={gp.id} className={cn(
          "overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md transition-all hover:shadow-lg",
          gp.status === "active" 
            ? "bg-gradient-to-r from-[#FF1801]/20 to-[#E10600]/10" 
            : "bg-gradient-to-r from-gray-50/60 to-gray-100/60 dark:from-gray-900/60 dark:to-gray-800/60"
        )}>
          <div className="h-1 w-full bg-[#FF1801]"></div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{gp.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(gp.start_date).toLocaleDateString("it-IT")} -{" "}
                  {new Date(gp.end_date).toLocaleDateString("it-IT")}
                </p>
                <Badge 
                  className={cn("mt-2 px-2 py-0.5 text-xs border-none", 
                    gp.status === "active" 
                      ? "bg-[#FF1801] text-white" 
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                  )}
                >
                  {gp.status === "active" ? "ATTIVO" : "IN ARRIVO"}
                </Badge>
              </div>
              <div>
                {gp.status === "active" ? (
                  <Link href={`/predictions/${gp.id}`}>
                    <Button size="sm" className="rounded-full bg-[#FF1801] hover:bg-[#E10600] text-white border-none shadow-md">
                      {predictions[gp.id] ? "Modifica" : "Fai previsioni"}
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    size="sm"
                    variant="outline" 
                    disabled 
                    className="opacity-60 rounded-full border-gray-300 dark:border-gray-700"
                  >
                    In arrivo
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PredictionHistory() {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Ottieni le previsioni dell'utente con i dettagli degli eventi e dei Gran Premi
        const { data: predictionsData, error: predictionsError } = await supabase
          .from("predictions")
          .select(`
            *,
            events(*, grand_prix(*))
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10)

        if (predictionsError) throw predictionsError

        // Raggruppa le previsioni per Gran Premio
        const groupedPredictions: Record<string, any> = {}

        predictionsData?.forEach((prediction: any) => {
          const gpId = prediction.events.grand_prix.id
          const gpName = prediction.events.grand_prix.name

          if (!groupedPredictions[gpId]) {
            groupedPredictions[gpId] = {
              id: gpId,
              name: gpName,
              start_date: prediction.events.grand_prix.start_date,
              end_date: prediction.events.grand_prix.end_date,
              status: prediction.events.grand_prix.status,
              predictions: [],
            }
          }

          groupedPredictions[gpId].predictions.push({
            id: prediction.id,
            event_name: prediction.events.name,
            prediction: prediction.prediction,
            created_at: prediction.created_at,
          })
        })

        setHistory(Object.values(groupedPredictions))
        setPredictions(predictionsData || [])
      } catch (error) {
        console.error("Errore nel caricamento dello storico:", error)
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
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Non hai ancora fatto previsioni per nessun Gran Premio</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((item: any) => (
        <Card
          key={item.id}
          className={cn(
            "overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md bg-gradient-to-br transition-all",
            item.status === "active" 
              ? "from-[#FF1801]/20 to-[#E10600]/10" 
              : item.status === "completed" 
                ? "from-[#0070f3]/15 to-[#00b4f3]/5" 
                : "from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
          )}
        >
          <div className="h-1 w-full bg-[#FF1801]"></div>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(item.start_date).toLocaleDateString("it-IT")} -{" "}
                    {new Date(item.end_date).toLocaleDateString("it-IT")}
                  </p>
                  <Badge
                    className={cn("mt-2 px-2 py-0.5 text-xs border-none", 
                      item.status === "active" 
                        ? "bg-[#FF1801] text-white" 
                        : item.status === "completed" 
                          ? "bg-[#0070f3] text-white" 
                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                    )}
                  >
                    {item.status === "active" ? "ATTIVO" : item.status === "upcoming" ? "IN ARRIVO" : "COMPLETATO"}
                  </Badge>
                </div>
                
                <div>
                  {item.status === "completed" ? (
                    <Link href={`/results/${item.id}`}>
                      <Button size="sm" className="rounded-full bg-[#0070f3] hover:bg-[#0060d0] text-white border-none shadow-md">
                        Risultati
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/predictions/${item.id}`}>
                      <Button size="sm" variant="outline" className="rounded-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                        {item.status === "active" ? "Modifica" : "Vedi"}
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              
              <div>
                <p className="font-medium text-sm mb-2">Le tue previsioni:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {item.predictions.slice(0, 3).map((pred: any) => {
                    const driverColor = getDriverTeamColor(pred.prediction);
                    
                    return (
                      <div key={pred.id} className="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
                        <div className={cn("p-2 flex items-center justify-between", driverColor.primary)}>
                          <div className={driverColor.secondary}>
                            <div className="text-xs font-semibold opacity-80">{pred.event_name}</div>
                            <div className="font-bold">{pred.prediction}</div>
                          </div>
                          <CheckCircle2 className={cn("h-4 w-4", driverColor.secondary)} />
                        </div>
                      </div>
                    );
                  })}
                  {item.predictions.length > 3 && (
                    <div className="text-center text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      + altre {item.predictions.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

