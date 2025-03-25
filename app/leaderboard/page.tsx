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
      <div className="main-container">
        <div className="space-y-8">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="main-container">
      <h1 className="section-title mb-8">Classifiche</h1>

      <Tabs defaultValue="grandprix" className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            <TabsTrigger value="grandprix" className="rounded-full px-5 py-2 data-[state=active]:bg-[#e10600] data-[state=active]:text-white">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span>Gran Premi</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="global" className="rounded-full px-5 py-2 data-[state=active]:bg-[#e10600] data-[state=active]:text-white">
              <div className="flex items-center gap-2">
                <Medal className="h-4 w-4" />
                <span>Generale</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grandprix" className="space-y-6">
          {completedGrandPrix.length === 0 ? (
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
              <div className="h-1.5 w-full bg-[#e10600]"></div>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400 py-4">Nessun Gran Premio completato</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <Select value={selectedGrandPrix || undefined} onValueChange={setSelectedGrandPrix}>
                  <SelectTrigger className="w-full rounded-xl h-12 border-gray-200 dark:border-gray-800 shadow-sm">
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
              </div>

              {selectedGrandPrixDetails && (
                <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                  <div className="h-1.5 w-full bg-[#e10600]"></div>
                  <CardContent className="px-6 py-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold">{selectedGrandPrixDetails.name}</h2>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{formatDate(selectedGrandPrixDetails.end_date)}</span>
                        </div>
                      </div>
                      <Badge className="self-start md:self-auto bg-[#e10600] text-white hover:bg-[#c00000] px-3 py-1 rounded-full">
                        COMPLETATO
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {grandPrixLeaderboard.length === 0 ? (
                <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                  <div className="h-1.5 w-full bg-[#e10600]"></div>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400 py-4">Nessun utente in classifica per questo Gran Premio</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400">
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
                    <Card key={entry.id} className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                      <div className={`h-1.5 w-full ${index < 3 ? 'bg-[#e10600]' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 flex justify-center">
                              {index === 0 ? (
                                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                </div>
                              ) : index === 1 ? (
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <Medal className="h-4 w-4 text-gray-400" />
                                </div>
                              ) : index === 2 ? (
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                  <Medal className="h-4 w-4 text-amber-700" />
                                </div>
                              ) : (
                                <span className="font-medium text-gray-500 dark:text-gray-400">{index + 1}</span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <div className="bg-[#e10600]/10 text-[#e10600] w-10 h-10 rounded-full flex items-center justify-center mr-3">
                                <User className="h-5 w-5" />
                              </div>
                              <span className="font-medium truncate max-w-[150px] md:max-w-none">
                                {entry.profiles.nickname || "Utente"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="font-bold text-xl">{entry.score}</div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1.5">pt</span>
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
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
            <div className="h-1.5 w-full bg-[#e10600]"></div>
            <CardContent className="px-6 py-5">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-5 w-5 text-[#e10600]" />
                <h2 className="text-xl font-bold">Classifica Generale</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Punti totali guadagnati in tutti i Gran Premi</p>
            </CardContent>
          </Card>

          {globalLeaderboard.length === 0 ? (
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
              <div className="h-1.5 w-full bg-[#e10600]"></div>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400 py-4">Nessun utente in classifica</p>
              </CardContent>
            </Card>
          ) :
            <div className="space-y-3">
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400">
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
                <Card key={user.id} className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                  <div className={`h-1.5 w-full ${index < 3 ? 'bg-[#e10600]' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 flex justify-center">
                          {index === 0 ? (
                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            </div>
                          ) : index === 1 ? (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <Medal className="h-4 w-4 text-gray-400" />
                            </div>
                          ) : index === 2 ? (
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                              <Medal className="h-4 w-4 text-amber-700" />
                            </div>
                          ) : (
                            <span className="font-medium text-gray-500 dark:text-gray-400">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <div className="bg-[#e10600]/10 text-[#e10600] w-10 h-10 rounded-full flex items-center justify-center mr-3">
                            <User className="h-5 w-5" />
                          </div>
                          <span className="font-medium truncate max-w-[150px] md:max-w-none">
                            {user.nickname || "Utente"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="font-bold text-xl">{user.total_score}</div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1.5">pt</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }
        </TabsContent>
      </Tabs>
    </div>
  )
}

