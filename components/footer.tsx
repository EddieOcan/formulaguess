import Link from "next/link"
import { Flag, Instagram, Twitter, Facebook } from "lucide-react"

export default function Footer() {
  return (
    <footer className="f1-footer">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1 rounded">
              <Flag className="h-4 w-4" />
            </div>
            <p className="text-center text-sm leading-loose md:text-left">
              &copy; {new Date().getFullYear()} Formula Guess. Tutti i diritti riservati.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Chi Siamo
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Termini
          </Link>
        </div>
        <div className="flex gap-4 md:ml-0">
          <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
            <Instagram className="h-5 w-5" />
            <span className="sr-only">Instagram</span>
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
            <Facebook className="h-5 w-5" />
            <span className="sr-only">Facebook</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}

