"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/database.types"
import { Skeleton } from "@/components/ui/skeleton"
import type { User } from "@supabase/supabase-js"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export default function ProfilePage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [nickname, setNickname] = useState("")
  const [saving, setSaving] = useState(false)
  const [nicknameExists, setNicknameExists] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUser(user)
      fetchProfile(user.id)
    }

    checkUser()
  }, [supabase, router])

  const fetchProfile = async (userId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) throw error

      setProfile(data)
      setFirstName(data.first_name || "")
      setLastName(data.last_name || "")
      setNickname(data.nickname || "")
    } catch (error) {
      console.error("Errore nel caricamento del profilo:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkNickname = async (newNickname: string) => {
    if (!newNickname || (profile && newNickname === profile.nickname)) {
      setNicknameExists(false)
      return false
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("nickname", newNickname)
        .neq("id", user?.id || "")
        .limit(1)

      if (error) throw error

      const exists = data && data.length > 0
      setNicknameExists(exists)
      return exists
    } catch (error) {
      console.error("Errore nel controllo del nickname:", error)
      return false
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    if (!nickname.trim()) {
      toast({
        title: "Errore",
        description: "Il nickname è obbligatorio",
        variant: "destructive",
      })
      return
    }

    const exists = await checkNickname(nickname)
    if (exists) {
      toast({
        title: "Errore",
        description: "Questo nickname è già in uso. Scegline un altro.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          nickname: nickname,
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Profilo aggiornato",
        description: "Il tuo profilo è stato aggiornato con successo",
      })

      fetchProfile(user.id)
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento del profilo",
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-1/4" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Il tuo Profilo</h1>

      <Card>
        <form onSubmit={handleUpdateProfile}>
          <CardHeader>
            <CardTitle>Informazioni Personali</CardTitle>
            <CardDescription>Aggiorna le tue informazioni personali</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">L'email non può essere modificata</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">
                Nickname <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value)
                  checkNickname(e.target.value)
                }}
                required
              />
              {nicknameExists && (
                <p className="text-xs text-red-500">Questo nickname è già in uso. Scegline un altro.</p>
              )}
              <p className="text-xs text-muted-foreground">Questo sarà il tuo nome visibile nelle classifiche</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Cognome</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Ruolo</Label>
              <Input
                id="role"
                value={profile?.role === "admin" ? "Amministratore" : "Utente"}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="score">Punteggio Totale</Label>
              <Input id="score" value={profile?.total_score || 0} disabled className="bg-muted" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Annulla
            </Button>
            <Button type="submit" disabled={saving || nicknameExists}>
              {saving ? "Salvataggio in corso..." : "Salva Modifiche"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

