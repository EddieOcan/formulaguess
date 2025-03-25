"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { BUCKETS, uploadFile, getPublicUrl } from "@/lib/storage-utils"
import { Loader2, Upload, X } from "lucide-react"

interface AvatarUploadProps {
  userId: string
  avatarUrl?: string | null
  onAvatarChange?: (url: string) => void
  size?: "sm" | "md" | "lg"
}

export function AvatarUpload({ userId, avatarUrl, onAvatarChange, size = "md" }: AvatarUploadProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string | null>(null)

  const sizeClass = {
    sm: "h-10 w-10",
    md: "h-20 w-20",
    lg: "h-32 w-32",
  }

  useEffect(() => {
    if (avatarUrl) {
      setAvatar(avatarUrl)
    } else {
      fetchAvatar()
    }

    fetchUserNickname()
  }, [userId, avatarUrl])

  const fetchAvatar = async () => {
    try {
      const filePath = `${userId}/avatar`
      const avatarUrl = getPublicUrl(BUCKETS.AVATARS, filePath)
      setAvatar(avatarUrl)
    } catch (error) {
      console.error("Errore nel recupero dell'avatar:", error)
    }
  }

  const fetchUserNickname = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("nickname").eq("id", userId).single()

      if (error) throw error

      setNickname(data.nickname)
    } catch (error) {
      console.error("Errore nel recupero del nickname:", error)
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `${userId}/avatar`

      setUploading(true)

      const result = await uploadFile(BUCKETS.AVATARS, filePath, file, { upsert: true })

      if (!result.success) {
        throw result.error
      }

      // Aggiorna l'avatar URL
      const newAvatarUrl = getPublicUrl(BUCKETS.AVATARS, filePath)
      setAvatar(newAvatarUrl)

      if (onAvatarChange) {
        onAvatarChange(newAvatarUrl)
      }

      toast({
        title: "Avatar aggiornato",
        description: "Il tuo avatar è stato aggiornato con successo",
      })
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante il caricamento dell'avatar",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      setUploading(true)

      const { data, error } = await supabase.storage.from(BUCKETS.AVATARS).remove([`${userId}/avatar`])

      if (error) throw error

      setAvatar(null)

      if (onAvatarChange) {
        onAvatarChange("")
      }

      toast({
        title: "Avatar rimosso",
        description: "Il tuo avatar è stato rimosso con successo",
      })
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la rimozione dell'avatar",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className={sizeClass[size]}>
        <AvatarImage src={avatar || ""} alt="Avatar utente" />
        <AvatarFallback>{nickname ? nickname.charAt(0).toUpperCase() : "U"}</AvatarFallback>
      </Avatar>

      <div className="flex gap-2">
        <div>
          <Label htmlFor="avatar" className="cursor-pointer">
            <div className="flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm font-medium">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Caricamento...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  Carica
                </>
              )}
            </div>
          </Label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="sr-only"
          />
        </div>

        {avatar && (
          <Button variant="outline" size="sm" onClick={handleRemoveAvatar} disabled={uploading}>
            <X className="h-4 w-4 mr-1" />
            Rimuovi
          </Button>
        )}
      </div>
    </div>
  )
}

