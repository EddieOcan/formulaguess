"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Database } from "@/lib/database.types"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Medal, Calendar, User, ArrowDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type GrandPrix = Database["public"]["Tables"]["grand_prix"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type LeaderboardEntry = {
  id: string;
  nickname: string | null;
  total_score: number | null;
}
type Leaderboard = Database["public"]["Tables"]["leaderboards"]["Row"] & {
  profiles: Profile
}

export default function LeaderboardPage() {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([])
  const [completedGrandPrix, setCompletedGrandPrix] = useState<GrandPrix[]>([])
  const [selectedGrandPrix, setSelectedGrandPrix] = useState<string | null>(null)
  const [grandPrixLeaderboard, setGrandPrixLeaderboard] = useState<Leaderboard[]>([])
  const [selectedGrandPrixDetails, setSelectedGrandPrixDetails] = useState<GrandPrix | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedGrandPrix) {
      fetchGrandPrixLeaderboard(selectedGrandPrix)
      // Trova i dettagli del Gran Premio selezionato
      const gpDetails = completedGrandPrix.find((gp) => gp.id === selectedGrandPrix) || null
      setSelectedGrandPrixDetails(gpDetails)
    }
  }, [selectedGrandPrix, completedGrandPrix])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Ottieni la classifica globale
      const { data: globalData } = await supabase
        .from("profiles")
        .select("id, nickname, total_score")
        .order("total_score", { ascending: false })

      setGlobalLeaderboard(globalData as LeaderboardEntry[] || [])

      // Ottieni i Gran Premi completati
      const { data: gpData } = await supabase.from("grand_prix").select("*").eq("status", "completed")

      if (gpData && gpData.length > 0) {
        // Ordina i Gran Premi per data di fine (dal più recente)
        const sortedGPs = [...gpData].sort((a, b) => {
          // Converti le stringhe di data in timestamp
          const dateA = new Date(a.end_date).getTime()
          const dateB = new Date(b.end_date).getTime()

          // Ordine decrescente (dal più recente al meno recente)
          return dateB - dateA
        })

        // Imposta i Gran Premi ordinati
        setCompletedGrandPrix(sortedGPs)

        // Seleziona il Gran Premio più recente
        if (sortedGPs.length > 0) {
          setSelectedGrandPrix(sortedGPs[0].id)
        }
      } else {
        setCompletedGrandPrix([])
      }
    } catch (error) {
      console.error("Errore nel caricamento dei dati:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGrandPrixLeaderboard = async (grandPrixId: string) => {
    try {
      const { data } = await supabase
        .from("leaderboards")
        .select(`
          *,
          profiles(id, nickname)
        `)
        .eq("grand_prix_id", grandPrixId)
        .order("score", { ascending: false })

      setGrandPrixLeaderboard((data as Leaderboard[]) || [])
    } catch (error) {
      console.error("Errore nel caricamento della classifica del Gran Premio:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container py-6 md:py-10">
        <Skeleton className="h-8 w-3/4 md:w-1/3 mb-4" />
        <Skeleton className="h-10 w-full mb-6" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-20 w-full mb-4" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 md:py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">
        <span className="bg-gradient-to-r from-[#FF1801] to-[#E10600] text-transparent bg-clip-text">Classifiche</span>
      </h1>

      <Tabs defaultValue="grandprix" className="space-y-6">
        <div className="flex justify-center mb-6">
          <TabsList className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
            <TabsTrigger value="grandprix" className="rounded-full px-4 py-2 data-[state=active]:bg-[#FF1801] data-[state=active]:text-white">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4" />
                <span>Gran Premi</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="global" className="rounded-full px-4 py-2 data-[state=active]:bg-[#FF1801] data-[state=active]:text-white">
              <div className="flex items-center gap-1.5">
                <Medal className="h-4 w-4" />
                <span>Generale</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grandprix" className="space-y-6">
          {completedGrandPrix.length === 0 ? (
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
              <div className="h-1 w-full bg-[#FF1801]"></div>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground py-4">Nessun Gran Premio completato</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
                <div className="h-1 w-full bg-[#FF1801]"></div>
                <CardContent className="p-4">
                  <Select value={selectedGrandPrix || undefined} onValueChange={setSelectedGrandPrix}>
                    <SelectTrigger className="w-full rounded-lg">
                      <SelectValue placeholder="Seleziona un Gran Premio" />
                    </SelectTrigger>
                    <SelectContent>
                      {completedGrandPrix.map((gp) => (
                        <SelectItem key={gp.id} value={gp.id}>
                          {gp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {selectedGrandPrixDetails && (
                <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg bg-gradient-to-br from-[#0070f3]/15 to-[#00b4f3]/5">
                  <div className="h-1 w-full bg-[#FF1801]"></div>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-xl font-bold">{selectedGrandPrixDetails.name}</h2>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(selectedGrandPrixDetails.end_date)}</span>
                        </div>
                      </div>
                      <Badge className="mt-2 md:mt-0 self-start md:self-auto bg-[#0070f3] text-white border-none px-3 py-1 rounded-full">
                        COMPLETATO
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {grandPrixLeaderboard.length === 0 ? (
                <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
                  <div className="h-1 w-full bg-[#FF1801]"></div>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground py-4">Nessun utente in classifica per questo Gran Premio</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm font-medium text-muted-foreground">
                    <div className="flex items-center">
                      <span className="w-10 text-center">#</span>
                      <span>Utente</span>
                    </div>
                    <div className="flex items-center">
                      <span>Punti</span>
                      <ArrowDown className="h-3 w-3 ml-1" />
                    </div>
                  </div>

                  {grandPrixLeaderboard.map((entry, index) => (
                    <Card key={entry.id} className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md">
                      <div className={`h-1 w-full ${index < 3 ? 'bg-[#FF1801]' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 flex justify-center">
                              {index === 0 ? (
                                <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                </div>
                              ) : index === 1 ? (
                                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                                  <Medal className="h-4 w-4 text-gray-400" />
                                </div>
                              ) : index === 2 ? (
                                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                                  <Medal className="h-4 w-4 text-amber-700" />
                                </div>
                              ) : (
                                <span className="font-medium text-muted-foreground">{index + 1}</span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <div className="bg-[#FF1801]/10 text-[#FF1801] w-8 h-8 rounded-full flex items-center justify-center mr-2">
                                <User className="h-4 w-4" />
                              </div>
                              <span className="font-medium truncate max-w-[150px] md:max-w-none">
                                {entry.profiles.nickname || "Utente"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="font-bold text-lg">{entry.score}</div>
                            <span className="text-xs text-muted-foreground ml-1">pt</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="global" className="space-y-6">
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg bg-gradient-to-br from-[#FF1801]/10 to-[#E10600]/5">
            <div className="h-1 w-full bg-[#FF1801]"></div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl">
                <Trophy className="mr-2 h-5 w-5 text-[#FFD700]" />
                Classifica Generale
              </CardTitle>
              <CardDescription>Punti totali guadagnati in tutti i Gran Premi</CardDescription>
            </CardHeader>
          </Card>

          {globalLeaderboard.length === 0 ? (
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
              <div className="h-1 w-full bg-[#FF1801]"></div>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground py-4">Nessun utente in classifica</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm font-medium text-muted-foreground">
                <div className="flex items-center">
                  <span className="w-10 text-center">#</span>
                  <span>Utente</span>
                </div>
                <div className="flex items-center">
                  <span>Punti totali</span>
                  <ArrowDown className="h-3 w-3 ml-1" />
                </div>
              </div>

              {globalLeaderboard.map((user, index) => (
                <Card key={user.id} className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md">
                  <div className={`h-1 w-full ${index < 3 ? 'bg-[#FF1801]' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 flex justify-center">
                          {index === 0 ? (
                            <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            </div>
                          ) : index === 1 ? (
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                              <Medal className="h-4 w-4 text-gray-400" />
                            </div>
                          ) : index === 2 ? (
                            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                              <Medal className="h-4 w-4 text-amber-700" />
                            </div>
                          ) : (
                            <span className="font-medium text-muted-foreground">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <div className="bg-[#FF1801]/10 text-[#FF1801] w-8 h-8 rounded-full flex items-center justify-center mr-2">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="font-medium truncate max-w-[150px] md:max-w-none">
                            {user.nickname || "Utente"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="font-bold text-lg">{user.total_score}</div>
                        <span className="text-xs text-muted-foreground ml-1">pt</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

