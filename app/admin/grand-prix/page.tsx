"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/database.types"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Trash2, Calendar, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type GrandPrix = Database["public"]["Tables"]["grand_prix"]["Row"]

export default function GrandPrixList() {
  const { supabase, isAdmin, isLoading } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [grandPrix, setGrandPrix] = useState<GrandPrix[]>([])
  const [grandPrixToDelete, setGrandPrixToDelete] = useState<string | null>(null)
  const [activatingGP, setActivatingGP] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) return

    if (!isAdmin) {
      router.push("/dashboard")
      return
    }

    fetchGrandPrix()
  }, [isAdmin, isLoading, router])

  const fetchGrandPrix = async () => {
    setLoading(true)
    try {
      // Aggiorna lo stato dei Gran Premi
      await supabase.rpc("run_update_grand_prix_status")

      const { data, error } = await supabase.from("grand_prix").select("*").order("start_date", { ascending: false })

      if (error) throw error

      setGrandPrix(data || [])
    } catch (error) {
      console.error("Errore nel caricamento dei Gran Premi:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel caricamento dei Gran Premi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGrandPrix = async (id: string) => {
    try {
      const { error } = await supabase.from("grand_prix").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Gran Premio eliminato",
        description: "Il Gran Premio è stato eliminato con successo",
      })

      fetchGrandPrix()
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'eliminazione del Gran Premio",
        variant: "destructive",
      })
    } finally {
      setGrandPrixToDelete(null)
    }
  }

  const handleActivateGrandPrix = async (id: string) => {
    setActivatingGP(id)
    try {
      // Prima disattiva tutti i Gran Premi attivi
      const { error: deactivateError } = await supabase
        .from("grand_prix")
        .update({ status: "upcoming" })
        .eq("status", "active")

      if (deactivateError) throw deactivateError

      // Poi attiva il Gran Premio selezionato
      const { error: activateError } = await supabase.from("grand_prix").update({ status: "active" }).eq("id", id)

      if (activateError) throw activateError

      toast({
        title: "Gran Premio attivato",
        description: "Il Gran Premio è stato attivato con successo",
      })

      fetchGrandPrix()
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'attivazione del Gran Premio",
        variant: "destructive",
      })
    } finally {
      setActivatingGP(null)
    }
  }

  if (isLoading || !isAdmin) {
    return (
      <div className="container py-10">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestione Gran Premi</h1>
        <Link href="/admin/grand-prix/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nuovo Gran Premio
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : grandPrix.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground mb-4">
              Non ci sono ancora Gran Premi. Crea il tuo primo Gran Premio!
            </p>
            <Link href="/admin/grand-prix/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nuovo Gran Premio
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
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
                    {gp.status === "upcoming" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivateGrandPrix(gp.id)}
                        disabled={activatingGP === gp.id}
                        className="bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-400"
                      >
                        {activatingGP === gp.id ? (
                          <span>Attivazione...</span>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" /> Attiva
                          </>
                        )}
                      </Button>
                    )}
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
                    <AlertDialog
                      open={grandPrixToDelete === gp.id}
                      onOpenChange={(open) => {
                        if (!open) setGrandPrixToDelete(null)
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setGrandPrixToDelete(gp.id)}
                          disabled={gp.status !== "upcoming"}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Questa azione non può essere annullata. Verranno eliminati anche tutti gli eventi, le
                            previsioni e i risultati associati a questo Gran Premio.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGrandPrix(gp.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

