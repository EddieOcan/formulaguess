"use client"

import type React from "react"

import { useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { BUCKETS, uploadFile, deleteFile, getPublicUrl } from "@/lib/storage-utils"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

interface GrandPrixImageUploadProps {
  grandPrixId: string
  imageUrl?: string | null
  onImageChange?: (url: string) => void
}

export function GrandPrixImageUpload({ grandPrixId, imageUrl, onImageChange }: GrandPrixImageUploadProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [image, setImage] = useState<string | null>(imageUrl || null)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `${grandPrixId}/cover`

      setUploading(true)

      const result = await uploadFile(BUCKETS.GRAND_PRIX_IMAGES, filePath, file, { upsert: true })

      if (!result.success) {
        throw result.error
      }

      // Aggiorna l'URL dell'immagine
      const newImageUrl = getPublicUrl(BUCKETS.GRAND_PRIX_IMAGES, filePath)
      setImage(newImageUrl)

      if (onImageChange) {
        onImageChange(newImageUrl)
      }

      toast({
        title: "Immagine aggiornata",
        description: "L'immagine del Gran Premio è stata aggiornata con successo",
      })
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante il caricamento dell'immagine",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    try {
      setUploading(true)

      await deleteFile(BUCKETS.GRAND_PRIX_IMAGES, `${grandPrixId}/cover`)

      setImage(null)

      if (onImageChange) {
        onImageChange("")
      }

      toast({
        title: "Immagine rimossa",
        description: "L'immagine del Gran Premio è stata rimossa con successo",
      })
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la rimozione dell'immagine",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
        {image ? (
          <Image src={image || "/placeholder.svg"} alt="Immagine Gran Premio" fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <p className="text-sm text-muted-foreground">Nessuna immagine</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <div>
          <Label htmlFor="grand-prix-image" className="cursor-pointer">
            <div className="flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm font-medium">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Caricamento...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  Carica immagine
                </>
              )}
            </div>
          </Label>
          <input
            id="grand-prix-image"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="sr-only"
          />
        </div>

        {image && (
          <Button variant="outline" onClick={handleRemoveImage} disabled={uploading}>
            <X className="h-4 w-4 mr-1" />
            Rimuovi
          </Button>
        )}
      </div>
    </div>
  )
}

