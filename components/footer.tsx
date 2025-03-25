import Link from "next/link"
import { Github } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Formula Guess. Tutti i diritti riservati.
            </div>
            <div className="flex items-center gap-3">
              <Link href="/privacy" className="text-sm hover:text-[var(--f1-red)] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm hover:text-[var(--f1-red)] transition-colors">
                Termini
              </Link>
              <Link href="/about" className="text-sm hover:text-[var(--f1-red)] transition-colors">
                Chi siamo
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/yourusername/formula-guess"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
            <span className="text-xs text-muted-foreground">
              Versione 1.0.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

