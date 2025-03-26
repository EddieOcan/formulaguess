import { Loader2 } from "lucide-react"

export default function LoadingFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-[var(--f1-red)] text-white p-3 rounded-xl shadow-md animate-pulse">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <p className="text-sm text-center font-medium">
          Caricamento in corso...
        </p>
      </div>
    </div>
  )
} 