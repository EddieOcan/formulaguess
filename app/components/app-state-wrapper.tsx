"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"

export default function AppStateWrapper({ children }: { children: React.ReactNode }) {
  const { refreshUserState } = useSupabase()
  const router = useRouter()

  // Semplice effetto per aggiornare lo stato quando la finestra torna in focus
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        await refreshUserState()
      }
    };

    // Aggiungi l'event listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshUserState]);

  return <>{children}</>;
} 