"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Database } from "@/lib/database.types"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Calendar, Flag, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

type GrandPrix = Database["public"]["Tables"]["grand_prix"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export default function AdminDashboard() {
  const { supabase, isAdmin, isLoading } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [grandPrixStats, setGrandPrixStats] = useState({
    active: 0,
    upcoming: 0,
    completed: 0,
    total: 0,
  })
  const [userStats, setUserStats] = useState({
    total: 0,
    admins: 0,
  })
  const [activeGrandPrix, setActiveGrandPrix] = useState<GrandPrix | null>(null)

  useEffect(() => {
    if (isLoading) return

    if (!isAdmin) {
      router.push("/dashboard")
      return
    }

    fetchDashboardData()
  }, [isAdmin, isLoading, router])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Aggiorna lo stato dei Gran Premi
      await supabase.rpc("run_update_grand_prix_status")

      // Statistiche Gran Premi
      const { data: gpData } = await supabase.from("grand_prix").select("status")

      if (gpData) {
        const stats = {
          active: gpData.filter((gp) => gp.status === "active").length,
          upcoming: gpData.filter((gp) => gp.status === "upcoming").length,
          completed: gpData.filter((gp) => gp.status === "completed").length,
          total: gpData.length,
        }
        setGrandPrixStats(stats)
      }

      // Statistiche Utenti
      const { data: userData, count: userCount } = await supabase.from("profiles").select("role", { count: "exact" })

      if (userData) {
        const stats = {
          total: userCount || 0,
          admins: userData.filter((user) => user.role === "admin").length,
        }
        setUserStats(stats)
      }

      // Gran Premio attivo
      const { data: activeGP } = await supabase
        .from("grand_prix")
        .select("*")
        .eq("status", "active")
        .order("start_date", { ascending: true })
        .limit(1)
        .single()

      setActiveGrandPrix(activeGP || null)
    } catch (error) {
      console.error("Errore nel caricamento dei dati:", error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || !isAdmin) {
    return (
      <div className="container py-10">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard Amministratore</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Gran Premi
            </CardTitle>
            <CardDescription>Panoramica dei Gran Premi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{grandPrixStats.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="bg-green-500/10">
                {grandPrixStats.active} attivi
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10">
                {grandPrixStats.upcoming} futuri
              </Badge>
              <Badge variant="outline" className="bg-gray-500/10">
                {grandPrixStats.completed} completati
              </Badge>
            </div>
            <div className="mt-4">
              <Link href="/admin/grand-prix">
                <Button variant="outline" size="sm">
                  Gestisci Gran Premi
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Utenti
            </CardTitle>
            <CardDescription>Panoramica degli utenti registrati</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userStats.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="bg-primary/10">
                {userStats.admins} amministratori
              </Badge>
              <Badge variant="outline" className="bg-gray-500/10">
                {userStats.total - userStats.admins} utenti standard
              </Badge>
            </div>
            <div className="mt-4">
              <Link href="/admin/users">
                <Button variant="outline" size="sm">
                  Gestisci Utenti
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Flag className="mr-2 h-5 w-5 text-primary" />
              Gran Premio Attivo
            </CardTitle>
            <CardDescription>Il Gran Premio attualmente in corso</CardDescription>
          </CardHeader>
          <CardContent>
            {activeGrandPrix ? (
              <div>
                <div className="text-xl font-bold">{activeGrandPrix.name}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(activeGrandPrix.start_date).toLocaleDateString("it-IT")} -{" "}
                  {new Date(activeGrandPrix.end_date).toLocaleDateString("it-IT")}
                </p>
                <div className="mt-4 flex gap-2">
                  <Link href={`/admin/events/${activeGrandPrix.id}`}>
                    <Button variant="outline" size="sm">
                      Gestisci Eventi
                    </Button>
                  </Link>
                  <Link href={`/admin/results/${activeGrandPrix.id}`}>
                    <Button size="sm">Inserisci Risultati</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-center text-muted-foreground">Nessun Gran Premio attivo al momento</p>
                <div className="mt-4">
                  <Link href="/admin/grand-prix/new">
                    <Button>Crea Nuovo Gran Premio</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <Tabs defaultValue="grandprix">
          <TabsList className="mb-4">
            <TabsTrigger value="grandprix">Gran Premi Recenti</TabsTrigger>
            <TabsTrigger value="leaderboard">Classifica Generale</TabsTrigger>
          </TabsList>
          <TabsContent value="grandprix" className="space-y-4">
            <RecentGrandPrix />
          </TabsContent>
          <TabsContent value="leaderboard" className="space-y-4">
            <GlobalLeaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function RecentGrandPrix() {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [grandPrix, setGrandPrix] = useState<GrandPrix[]>([])

  useEffect(() => {
    const fetchGrandPrix = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from("grand_prix")
          .select("*")
          .order("start_date", { ascending: false })
          .limit(5)

        setGrandPrix(data || [])
      } catch (error) {
        console.error("Errore nel caricamento dei Gran Premi:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGrandPrix()
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

  if (grandPrix.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Nessun Gran Premio trovato</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {grandPrix.map((gp) => (
        <Card key={gp.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">{gp.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(gp.start_date).toLocaleDateString("it-IT")} -{" "}
                  {new Date(gp.end_date).toLocaleDateString("it-IT")}
                </p>
                <Badge
                  className="mt-2"
                  variant={gp.status === "active" ? "default" : gp.status === "upcoming" ? "outline" : "secondary"}
                >
                  {gp.status === "active" ? "Attivo" : gp.status === "upcoming" ? "In arrivo" : "Completato"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/events/${gp.id}`}>
                  <Button variant="outline" size="sm">
                    Eventi
                  </Button>
                </Link>
                <Link href={`/admin/results/${gp.id}`}>
                  <Button variant="outline" size="sm">
                    Risultati
                  </Button>
                </Link>
                <Link href={`/admin/leaderboard/${gp.id}`}>
                  <Button variant="outline" size="sm">
                    Classifica
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function GlobalLeaderboard() {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState<Profile[]>([])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from("profiles")
          .select("id, nickname, total_score")
          .order("total_score", { ascending: false })
          .limit(10)

        setLeaderboard(data || [])
      } catch (error) {
        console.error("Errore nel caricamento della classifica:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [supabase])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-full mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Nessun utente in classifica</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="rounded-md border">
          <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
            <div className="col-span-1">#</div>
            <div className="col-span-8">Utente</div>
            <div className="col-span-3 text-right">Punti</div>
          </div>
          {leaderboard.map((user, index) => (
            <div key={user.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0">
              <div className="col-span-1 font-medium">{index + 1}</div>
              <div className="col-span-8">{user.nickname || "Utente senza nickname"}</div>
              <div className="col-span-3 text-right font-bold">{user.total_score}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <Link href="/admin/leaderboard">
            <Button variant="link" className="p-0 h-auto">
              Visualizza classifica completa
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

