"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import type { Database } from "@/lib/database.types"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"

type GrandPrix = Database["public"]["Tables"]["grand_prix"]["Row"]
type Event = Database["public"]["Tables"]["events"]["Row"]

// Componente interno che gestisce la logica
function EventsContent({ gpId }: { gpId: { id: string } }) {
  const [id, setId] = useState<string>("");
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [grandPrix, setGrandPrix] = useState<GrandPrix | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [newEventOpen, setNewEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    points: 1,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Estrai l'ID in modo sicuro all'interno dell'useEffect
    setId(gpId?.id || "");
  }, [gpId]);

  useEffect(() => {
    if (!id) return; // Skip if id is not yet available
    
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (!data || data.role !== "admin") {
        router.push("/dashboard")
        return
      }

      setIsAdmin(true)
      fetchData()
    }

    checkAdmin()
  }, [supabase, router, id])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Ottieni il Gran Premio
      const { data: gp, error: gpError } = await supabase.from("grand_prix").select("*").eq("id", id).single()

      if (gpError) throw gpError
      setGrandPrix(gp)

      // Ottieni gli eventi esistenti
      const { data: existingEvents, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("grand_prix_id", id)

      if (eventsError) throw eventsError
      setEvents(existingEvents || [])
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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newEvent.name) {
      toast({
        title: "Errore",
        description: "Il nome dell'evento è obbligatorio",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.from("events").insert({
        grand_prix_id: id,
        name: newEvent.name,
        description: newEvent.description,
        points: newEvent.points,
      })

      if (error) throw error

      toast({
        title: "Evento creato",
        description: "L'evento è stato creato con successo",
      })

      setNewEvent({
        name: "",
        description: "",
        points: 1,
      })
      setNewEventOpen(false)
      fetchData()
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la creazione dell'evento",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId)

      if (error) throw error

      toast({
        title: "Evento eliminato",
        description: "L'evento è stato eliminato con successo",
      })

      fetchData()
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'eliminazione dell'evento",
        variant: "destructive",
      })
    }
  }

  if (!isAdmin || loading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{grandPrix?.name}</h1>
          <p className="text-muted-foreground">
            {new Date(grandPrix?.start_date || "").toLocaleDateString("it-IT")} -{" "}
            {new Date(grandPrix?.end_date || "").toLocaleDateString("it-IT")}
          </p>
        </div>
        <Dialog open={newEventOpen} onOpenChange={setNewEventOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Aggiungi Evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateEvent}>
              <DialogHeader>
                <DialogTitle>Crea Nuovo Evento</DialogTitle>
                <DialogDescription>Aggiungi un nuovo evento per questo Gran Premio</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Evento</Label>
                  <Input
                    id="name"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    placeholder="es. Vincitore Gara"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrizione</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Descrizione dell'evento"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Punti</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={String(newEvent.points || "")}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        points: e.target.value === "" ? 0 : Number.parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNewEventOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Creazione in corso..." : "Crea Evento"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nessun evento</AlertTitle>
          <AlertDescription>
            Non ci sono eventi per questo Gran Premio. Aggiungi il primo evento utilizzando il pulsante "Aggiungi
            Evento".
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{event.name}</CardTitle>
                    <CardDescription>{event.description || "Nessuna descrizione"}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Punti: <strong>{event.points}</strong>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Link href="/admin/grand-prix">
          <Button variant="outline">Torna ai Gran Premi</Button>
        </Link>
        <Link href={`/admin/results/${id}`}>
          <Button>Gestisci Risultati</Button>
        </Link>
      </div>
    </div>
  )
}

// Componente principale che passa l'oggetto params al componente interno
export default function EventsPage({ params }: { params: { id: string } }) {
  return <EventsContent gpId={params} />
}

