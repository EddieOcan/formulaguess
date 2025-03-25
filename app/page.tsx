import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Trophy, Calendar, Users, Award, ChevronRight, Flag, Star, Check } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none">
                  <span className="bg-gradient-to-r from-[#FF1801] to-[#E10600] text-transparent bg-clip-text">Formula</span>{" "}
                  <span className="font-bold">Guess</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px]">
                  Metti alla prova le tue conoscenze di Formula 1 e sfida gli altri appassionati in tempo reale
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" className="rounded-full bg-[#FF1801] hover:bg-[#E10600] text-white px-8 shadow-md">
                    Inizia Ora
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="rounded-full border-gray-300 dark:border-gray-700 px-8">
                    Accedi
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-6 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#FF1801]/10 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#FF1801]" />
                  </div>
                  <span>Previsioni in tempo reale</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#FF1801]/10 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#FF1801]" />
                  </div>
                  <span>Classifica aggiornata</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#FF1801]/10 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#FF1801]" />
                  </div>
                  <span>Sfida gli amici</span>
                </div>
              </div>
            </div>
            
            <div className="relative hidden aspect-square lg:block">
              <div className="absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-br from-[#FF1801] to-[#E10600]">
                <div className="absolute inset-0 opacity-20" style={{ 
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.5' fill-rule='evenodd'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/svg%3E\")" 
                }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center p-8">
                    <Flag className="h-16 w-16 mx-auto mb-6 text-white" />
                    <h2 className="text-3xl font-bold mb-2">Previsioni F1</h2>
                    <p className="text-lg opacity-90">Indovina i risultati e scala la classifica!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-muted/30 rounded-xl f1-pattern">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl f1-heading">Come Funziona</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Fai le tue previsioni sui Gran Premi di Formula 1 e guadagna punti in base all'accuratezza
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <Card className="f1-card">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <div className="grid gap-1">
                  <CardTitle>Scegli il Gran Premio</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Seleziona il Gran Premio attivo e fai le tue previsioni su vari eventi come podio, giro veloce e altro
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="f1-card f1-card-accent">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-accent/10 p-2 rounded-full">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <div className="grid gap-1">
                  <CardTitle>Fai le tue Previsioni</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Per ogni evento, scegli il pilota che pensi vincerà o otterrà il risultato previsto
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="f1-card f1-card-success">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-success/10 p-2 rounded-full">
                  <Trophy className="h-8 w-8 text-success" />
                </div>
                <div className="grid gap-1">
                  <CardTitle>Guadagna Punti</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ottieni punti per ogni previsione corretta e scala la classifica generale
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

