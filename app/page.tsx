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

      <section className="py-14 bg-gray-50 dark:bg-gray-900/50 rounded-3xl my-8">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Come Funziona
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
              Tre semplici passi per iniziare a giocare e divertirti con gli amici
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="bg-white dark:bg-gray-800/50 border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-[#FF1801]/10 flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-[#FF1801]" />
                </div>
                <CardTitle className="text-xl">1. Controlla il Calendario</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Visualizza i prossimi Gran Premi e prepara le tue previsioni in anticipo.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800/50 border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-[#FF1801]/10 flex items-center justify-center mb-2">
                  <Trophy className="h-6 w-6 text-[#FF1801]" />
                </div>
                <CardTitle className="text-xl">2. Fai le Tue Previsioni</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Seleziona i piloti che pensi finiranno sul podio e fai altre previsioni sul Gran Premio.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800/50 border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-[#FF1801]/10 flex items-center justify-center mb-2">
                  <Award className="h-6 w-6 text-[#FF1801]" />
                </div>
                <CardTitle className="text-xl">3. Guadagna Punti</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Guadagna punti per ogni previsione corretta e scala la classifica per diventare il campione.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Caratteristiche Principali
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
              Scopri tutte le funzionalità che rendono Formula Guess un'esperienza unica
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="group relative overflow-hidden rounded-lg border bg-white dark:bg-gray-800/50 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="p-6 flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-[#FF1801]/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-[#FF1801]" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Calendario Gare</h3>
                <p className="text-muted-foreground flex-grow">
                  Visualizza il calendario completo della stagione con date, circuiti e informazioni dettagliate.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF1801] to-[#E10600] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            
            <div className="group relative overflow-hidden rounded-lg border bg-white dark:bg-gray-800/50 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="p-6 flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-[#FF1801]/10 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-[#FF1801]" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Sistema di Previsioni</h3>
                <p className="text-muted-foreground flex-grow">
                  Fai previsioni sui risultati delle gare e guadagna punti in base alla precisione delle tue scommesse.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF1801] to-[#E10600] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            
            <div className="group relative overflow-hidden rounded-lg border bg-white dark:bg-gray-800/50 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="p-6 flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-[#FF1801]/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-[#FF1801]" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Leghe Private</h3>
                <p className="text-muted-foreground flex-grow">
                  Crea leghe private e sfida i tuoi amici per vedere chi è il miglior pronosticatore di Formula 1.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF1801] to-[#E10600] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            
            <div className="group relative overflow-hidden rounded-lg border bg-white dark:bg-gray-800/50 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="p-6 flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-[#FF1801]/10 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-[#FF1801]" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Statistiche Dettagliate</h3>
                <p className="text-muted-foreground flex-grow">
                  Analizza le tue performance con statistiche dettagliate sulla precisione delle tue previsioni.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF1801] to-[#E10600] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            
            <div className="group relative overflow-hidden rounded-lg border bg-white dark:bg-gray-800/50 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="p-6 flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-[#FF1801]/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-[#FF1801]" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Classifiche Globali</h3>
                <p className="text-muted-foreground flex-grow">
                  Compete nella classifica mondiale e combatti per diventare il miglior pronosticatore del mondo.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF1801] to-[#E10600] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            
            <div className="group relative overflow-hidden rounded-lg border bg-white dark:bg-gray-800/50 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="p-6 flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-[#FF1801]/10 flex items-center justify-center mb-4">
                  <Flag className="h-6 w-6 text-[#FF1801]" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Notifiche in Tempo Reale</h3>
                <p className="text-muted-foreground flex-grow">
                  Ricevi notifiche in tempo reale sui risultati delle gare e l'aggiornamento delle tue previsioni.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF1801] to-[#E10600] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl my-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Pronto per la Sfida?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl">
                Unisciti a migliaia di appassionati della Formula 1 e metti alla prova le tue conoscenze.
              </p>
            </div>
            <div className="flex flex-col gap-4 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg" className="rounded-full bg-[#FF1801] hover:bg-[#E10600] text-white px-8 shadow-md">
                  Registrati Ora
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-full border-gray-300 dark:border-gray-700 px-8">
                  Accedi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 border-t">
        <div className="container flex flex-col items-center justify-center space-y-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 Formula Guess. Tutti i diritti riservati. Non affiliato ufficialmente alla Formula 1.
          </p>
        </div>
      </footer>
    </div>
  )
}

