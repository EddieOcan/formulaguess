"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/database.types"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy } from "lucide-react"
import Link from "next/link"

type GrandPrix = Database["public"]["Tables"]["grand_prix"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Leaderboard = Database["public"]["Tables"]["leaderboards"]["Row"] & {
  profiles: Profile
}

// Componente interno che gestisce la logica
function LeaderboardContent({ gpId }: { gpId: { id: string } }) {
  const [id, setId] = useState<string>("");
  const { supabase, isAdmin, isLoading } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [grandPrix, setGrandPrix] = useState<GrandPrix | null>(null)
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([])

  useEffect(() => {
    // Estrai l'ID in modo sicuro all'interno dell'useEffect
    setId(gpId?.id || "");
  }, [gpId]);

  useEffect(() => {
    if (!id) return; // Skip if id is not yet available
    if (isLoading) return;

    if (!isAdmin) {
      router.push("/dashboard")
      return
    }

    fetchData()
  }, [isAdmin, isLoading, router, id])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Ottieni il Gran Premio
      const { data: gp, error: gpError } = await supabase.from("grand_prix").select("*").eq("id", id).single()

      if (gpError) throw gpError
      setGrandPrix(gp)

      // Ottieni la classifica del Gran Premio
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from("leaderboards")
        .select(`
          *,
          profiles(id, nickname)
        `)
        .eq("grand_prix_id", id)
        .order("score", { ascending: false })

      if (leaderboardError) throw leaderboardError
      setLeaderboard((leaderboardData as Leaderboard[]) || [])
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

  if (isLoading || !isAdmin || loading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <Skeleton className="h-6 w-1/4 mb-4" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-full mb-4" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Classifica: {grandPrix?.name}</h1>
          <p className="text-muted-foreground">
            {new Date(grandPrix?.start_date || "").toLocaleDateString("it-IT")} -{" "}
            {new Date(grandPrix?.end_date || "").toLocaleDateString("it-IT")}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-primary" />
            Classifica
          </CardTitle>
          <CardDescription>Classifica degli utenti per questo Gran Premio</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nessun utente in classifica per questo Gran Premio</p>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                <div className="col-span-1">#</div>
                <div className="col-span-8">Utente</div>
                <div className="col-span-3 text-right">Punti</div>
              </div>
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0">
                  <div className="col-span-1 font-medium">
                    {index === 0 ? <Trophy className="h-5 w-5 text-yellow-500" /> : index + 1}
                  </div>
                  <div className="col-span-8">{entry.profiles.nickname || "Utente senza nickname"}</div>
                  <div className="col-span-3 text-right font-bold">{entry.score}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <Link href="/admin/grand-prix">
          <Button variant="outline">Torna ai Gran Premi</Button>
        </Link>
      </div>
    </div>
  )
}

// Componente principale che estrae l'ID e passa al componente interno
export default function GrandPrixLeaderboard({ params }: { params: { id: string } }) {
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
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-full mb-4" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return <LeaderboardContent gpId={gpId} />;
}

