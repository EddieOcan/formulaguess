"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Flag } from "lucide-react"

export default function Register() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [nickname, setNickname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!nickname.trim()) {
      toast({
        title: "Errore",
        description: "Il nickname è obbligatorio",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      // Verifica se il nickname è già in uso
      const { data: existingUsers, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("nickname", nickname)
        .limit(1)

      if (checkError) throw checkError

      if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Errore",
          description: "Questo nickname è già in uso. Scegline un altro.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            nickname: nickname,
          },
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Aggiorna il profilo con nome, cognome e nickname
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            first_name: firstName,
            last_name: lastName,
            nickname: nickname,
          })
          .eq("id", data.user.id)

        if (profileError) {
          console.error("Errore nell'aggiornamento del profilo:", profileError)
        }
      }

      toast({
        title: "Registrazione completata",
        description: "Controlla la tua email per confermare la registrazione",
      })

      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la registrazione",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <Flag className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Crea un account</h1>
          <p className="text-sm text-muted-foreground">Inserisci i tuoi dati per registrarti</p>
        </div>

        <Card>
          <form onSubmit={handleRegister}>
            <CardHeader>
              <CardTitle>Registrati</CardTitle>
              <CardDescription>Crea il tuo account Formula Guess</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">
                  Nickname <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                  placeholder="Il tuo nickname pubblico"
                />
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
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registrazione in corso..." : "Registrati"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Hai già un account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Accedi
          </Link>
        </div>
      </div>
    </div>
  )
}

