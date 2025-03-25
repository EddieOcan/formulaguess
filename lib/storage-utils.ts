import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/app/env"
import type { Database } from "./database.types"

// Crea un singleton client per evitare di creare più istanze
const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

// Bucket per i vari tipi di file
export const BUCKETS = {
  AVATARS: "avatars",
  GRAND_PRIX_IMAGES: "grand-prix-images",
  TEAM_LOGOS: "team-logos",
  DRIVER_PHOTOS: "driver-photos",
}

/**
 * Inizializza i bucket di storage se non esistono già
 */
export async function initializeStorage() {
  try {
    // Crea i bucket se non esistono
    for (const bucket of Object.values(BUCKETS)) {
      const { data, error } = await supabaseClient.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (error && error.message !== "Bucket already exists") {
        console.error(`Errore nella creazione del bucket ${bucket}:`, error)
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Errore nell'inizializzazione dello storage:", error)
    return { success: false, error }
  }
}

/**
 * Carica un file nel bucket specificato
 */
export async function uploadFile(bucket: string, filePath: string, file: File, options?: { upsert?: boolean }) {
  try {
    const { data, error } = await supabaseClient.storage.from(bucket).upload(filePath, file, {
      upsert: options?.upsert || false,
      cacheControl: "3600",
    })

    if (error) throw error

    // Ottieni l'URL pubblico del file
    const { data: publicUrlData } = supabaseClient.storage.from(bucket).getPublicUrl(filePath)

    return { success: true, data: { ...data, publicUrl: publicUrlData.publicUrl } }
  } catch (error) {
    console.error(`Errore nel caricamento del file in ${bucket}:`, error)
    return { success: false, error }
  }
}

/**
 * Ottiene l'URL pubblico di un file
 */
export function getPublicUrl(bucket: string, filePath: string) {
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * Elimina un file dal bucket specificato
 */
export async function deleteFile(bucket: string, filePath: string) {
  try {
    const { error } = await supabaseClient.storage.from(bucket).remove([filePath])

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error(`Errore nell'eliminazione del file da ${bucket}:`, error)
    return { success: false, error }
  }
}

/**
 * Elenca i file in un bucket o in una cartella specifica
 */
export async function listFiles(bucket: string, folderPath?: string) {
  try {
    const { data, error } = await supabaseClient.storage.from(bucket).list(folderPath || "")

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error(`Errore nell'elenco dei file in ${bucket}:`, error)
    return { success: false, error }
  }
}

