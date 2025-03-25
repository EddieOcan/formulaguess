import Image from "next/image"
import type { Database } from "@/lib/database.types"
import { Circle } from "lucide-react"

type Driver = Database["public"]["Tables"]["drivers"]["Row"]

interface DriverPreviewProps {
  driver: Driver
}

export function DriverPreview({ driver }: DriverPreviewProps) {
  // Costruisci il percorso dell'immagine del pilota
  const driverImagePath = `/drivers/${driver.name.toLowerCase().replace(/\s+/g, "-")}.png`

  // Ottieni il colore del team
  const teamColor = getTeamColor(driver.team)

  return (
    <div className="flex items-center p-4 rounded-lg border bg-card">
      <div className="flex-shrink-0 mr-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-full border-2" style={{ borderColor: teamColor }}>
          <Image
            src={driverImagePath || "/placeholder.svg"}
            alt={driver.name}
            width={48}
            height={48}
            className="object-cover"
            onError={(e) => {
              // Fallback se l'immagine non esiste
              e.currentTarget.src = "/placeholder.svg?height=48&width=48"
            }}
          />
        </div>
      </div>
      <div>
        <div className="flex items-center">
          <Circle className="h-3 w-3 mr-2" fill={teamColor} color={teamColor} />
          <span className="font-medium">and: {driver.name}</span>
        </div>
        <p className="text-sm text-muted-foreground">{driver.team}</p>
      </div>
    </div>
  )
}

// Funzione per ottenere il colore del team
function getTeamColor(team: string): string {
  const teamColors: Record<string, string> = {
    Ferrari: "#F91536",
    Mercedes: "#00D2BE",
    "Red Bull Racing": "#0600EF",
    McLaren: "#FF8700",
    Alpine: "#0090FF",
    AlphaTauri: "#2B4562",
    "Aston Martin": "#006F62",
    Williams: "#005AFF",
    "Alfa Romeo": "#900000",
    "Haas F1 Team": "#FFFFFF",
  }

  return teamColors[team] || "#CCCCCC"
}

