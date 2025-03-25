"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { useSupabase } from "@/lib/supabase-provider"
import { useEffect, useState, useCallback } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Flag, Menu, X, Trophy, Home, User, LogOut, Settings, BarChart3, RefreshCw } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export default function Header() {
  const { supabase, isAdmin, isLoading, refreshUserState } = useSupabase()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const getUser = useCallback(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      
      if (error) {
        console.error("Error fetching user:", error)
        return
      }
      
      setUser(user)
    } catch (error) {
      console.error("Failed to get user:", error)
    }
  }, [supabase])

  useEffect(() => {
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
    })

    // Controlla lo stato dell'utente ogni volta che la finestra torna in focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        getUser()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      authListener.subscription.unsubscribe()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [supabase, getUser])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshUserState()
      await getUser()
    } catch (error) {
      console.error("Error refreshing user state:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <header className="f1-header">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="f1-header">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[var(--f1-red)] text-white p-1.5 rounded-md shadow-sm transition-transform group-hover:scale-110">
              <Flag className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold f1-gradient-text">Formula Guess</span>
          </Link>
        </div>

        {/* Menu desktop */}
        <div className="hidden md:flex md:items-center md:gap-6">
          <nav className="flex items-center space-x-1 rounded-lg border bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm p-1 shadow-sm">
            <Link href="/" className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--f1-red)] hover:text-white focus:bg-[var(--f1-red)] focus:text-white focus:outline-none">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
            
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--f1-red)] hover:text-white focus:bg-[var(--f1-red)] focus:text-white focus:outline-none">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            
            <Link href="/leaderboard" className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--f1-red)] hover:text-white focus:bg-[var(--f1-red)] focus:text-white focus:outline-none">
              <Trophy className="mr-2 h-4 w-4" />
              Classifiche
            </Link>
            
            {isAdmin && (
              <Link href="/admin" className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--f1-red)] hover:text-white focus:bg-[var(--f1-red)] focus:text-white focus:outline-none">
                <Settings className="mr-2 h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Aggiorna stato"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <ModeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-[var(--f1-red)] hover:border-opacity-80 transition-all">
                    <Avatar className="h-full w-full">
                      <AvatarImage src="/placeholder.svg" alt={user.email || ""} />
                      <AvatarFallback className="bg-[var(--f1-red)]/10 text-[var(--f1-red)]">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-1 rounded-xl overflow-hidden shadow-lg" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {isAdmin ? "Amministratore" : "Utente"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profilo
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-lg">
                  <Link href="/login">Accedi</Link>
                </Button>
                <Button asChild size="sm" className="rounded-lg bg-[var(--f1-red)] hover:bg-[var(--f1-dark-red)]">
                  <Link href="/register">Registrati</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Menu mobile */}
        <div className="md:hidden flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Aggiorna stato"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px] p-0">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-[var(--f1-red)] text-white p-1.5 rounded-md">
                        <Flag className="h-5 w-5" />
                      </div>
                      <span className="text-xl font-bold f1-gradient-text">Formula Guess</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto py-2">
                  <div className="flex flex-col space-y-1 px-2">
                    <Link
                      href="/"
                      className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Home className="mr-3 h-5 w-5 text-[var(--f1-red)]" />
                      <span className="font-medium">Home</span>
                    </Link>
                    
                    {user && (
                      <Link
                        href="/dashboard"
                        className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <BarChart3 className="mr-3 h-5 w-5 text-[var(--f1-red)]" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                    )}
                    
                    <Link
                      href="/leaderboard"
                      className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Trophy className="mr-3 h-5 w-5 text-[var(--f1-red)]" />
                      <span className="font-medium">Classifiche</span>
                    </Link>
                    
                    {user && (
                      <Link
                        href="/profile"
                        className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="mr-3 h-5 w-5 text-[var(--f1-red)]" />
                        <span className="font-medium">Profilo</span>
                      </Link>
                    )}
                    
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="mr-3 h-5 w-5 text-[var(--f1-red)]" />
                        <span className="font-medium">Admin</span>
                      </Link>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t mt-auto">
                  {user ? (
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border-2 border-[var(--f1-red)]">
                          <AvatarImage src="/placeholder.svg" alt={user.email || ""} />
                          <AvatarFallback className="bg-[var(--f1-red)]/10 text-[var(--f1-red)]">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {isAdmin ? "Amministratore" : "Utente"}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          handleSignOut()
                          setIsMenuOpen(false)
                        }}
                        className="w-full bg-[var(--f1-red)] hover:bg-[var(--f1-dark-red)]"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                          Accedi
                        </Link>
                      </Button>
                      <Button asChild className="w-full bg-[var(--f1-red)] hover:bg-[var(--f1-dark-red)]">
                        <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                          Registrati
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

