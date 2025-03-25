import { cn } from "@/lib/utils"
import Image from "next/image"
import type { Database } from "@/lib/database.types"

type Driver = Database["public"]["Tables"]["drivers"]["Row"]

// Mappa dei colori dei team F1
export const teamColors: Record<string, { primary: string; secondary: string; gradient: string }> = {
  Ferrari: {
    primary: "bg-[#F91536]",
    secondary: "text-white",
    gradient: "linear-gradient(135deg, #F91536 0%, #990000 100%)",
  },
  Mercedes: {
    primary: "bg-[#00D2BE]",
    secondary: "text-black",
    gradient: "linear-gradient(135deg, #00D2BE 0%, #007A71 100%)",
  },
  "Red Bull Racing": {
    primary: "bg-[#0600EF]",
    secondary: "text-white",
    gradient: "linear-gradient(135deg, #0600EF 0%, #000066 100%)",
  },
  McLaren: {
    primary: "bg-[#FF8700]",
    secondary: "text-black",
    gradient: "linear-gradient(135deg, #FF8700 0%, #FF5500 100%)",
  },
  Alpine: {
    primary: "bg-[#0090FF]",
    secondary: "text-white",
    gradient: "linear-gradient(135deg, #0090FF 0%, #0050AA 100%)",
  },
  AlphaTauri: {
    primary: "bg-[#2B4562]",
    secondary: "text-white",
    gradient: "linear-gradient(135deg, #2B4562 0%, #1A2A3C 100%)",
  },
  "Aston Martin": {
    primary: "bg-[#006F62]",
    secondary: "text-white",
    gradient: "linear-gradient(135deg, #006F62 0%, #004C42 100%)",
  },
  Williams: {
    primary: "bg-[#005AFF]",
    secondary: "text-white",
    gradient: "linear-gradient(135deg, #005AFF 0%, #0030AA 100%)",
  },
  "Alfa Romeo": {
    primary: "bg-[#900000]",
    secondary: "text-white",
    gradient: "linear-gradient(135deg, #900000 0%, #500000 100%)",
  },
  "Haas F1 Team": {
    primary: "bg-[#FFFFFF]",
    secondary: "text-black",
    gradient: "linear-gradient(135deg, #FFFFFF 0%, #CCCCCC 100%)",
  },
  // Aggiungi altri team se necessario
}

interface DriverCardProps {
  driver: Driver
  size?: "sm" | "md" | "lg"
  showTeam?: boolean
}

export function DriverCard({ driver, size = "md", showTeam = true }: DriverCardProps) {
  const teamColor = teamColors[driver.team] || {
    primary: "bg-gray-200",
    secondary: "text-black",
    gradient: "linear-gradient(135deg, #E0E0E0 0%, #BBBBBB 100%)",
  }

  // Dimensioni in base alla proprietà size
  const imageSizes = {
    sm: { width: 64, height: 64, containerClass: "h-16 w-16" },
    md: { width: 96, height: 96, containerClass: "h-24 w-24" },
    lg: { width: 128, height: 128, containerClass: "h-32 w-32" },
  }

  const { width, height, containerClass } = imageSizes[size]

  // Costruisci il percorso dell'immagine del pilota
  const driverImagePath = `/drivers/${driver.name.toLowerCase().replace(/\s+/g, "-")}.png`

  return (
    <div className="relative overflow-hidden rounded-lg border p-2 transition-all hover:shadow-md">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: teamColor.gradient,
        }}
      />
      <div className="relative flex flex-col items-center p-2">
        <div className={cn("relative overflow-hidden rounded-full border-2 border-primary mb-2", containerClass)}>
          <Image
            src={driverImagePath || "/placeholder.svg"}
            alt={driver.name}
            width={width}
            height={height}
            className="object-cover"
            onError={(e) => {
              // Fallback se l'immagine non esiste
              e.currentTarget.src = `/placeholder.svg?height=${height}&width=${width}`
            }}
          />
        </div>
        <h3 className="text-center font-bold">{driver.name}</h3>
        {showTeam && (
          <span className={cn("text-xs px-2 py-0.5 rounded-full mt-1", teamColor.primary, teamColor.secondary)}>
            {driver.team}
          </span>
        )}
      </div>
    </div>
  )
}

