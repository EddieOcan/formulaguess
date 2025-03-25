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
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { useSupabase } from "@/lib/supabase-provider"
import { useEffect, useState } from "react"
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
import { Flag, Menu, X, Trophy, Home, User, LogOut, Settings } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export default function Header() {
  const { supabase, isAdmin, isLoading } = useSupabase()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <header className="f1-header">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1 rounded">
                <Flag className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">Formula Guess</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="f1-header">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#FF1801] text-white p-1.5 rounded-full shadow-md transition-transform group-hover:scale-110">
              <Flag className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#FF1801] to-[#E10600] text-transparent bg-clip-text">Formula Guess</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-4">
          <NavigationMenu>
            <NavigationMenuList className="bg-white dark:bg-gray-800/60 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className="px-3 py-2 rounded-lg font-medium hover:bg-[#FF1801] hover:text-white data-[active]:bg-[#FF1801] data-[active]:text-white transition-all flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/leaderboard" legacyBehavior passHref>
                  <NavigationMenuLink className="px-3 py-2 rounded-lg font-medium hover:bg-[#FF1801] hover:text-white data-[active]:bg-[#FF1801] data-[active]:text-white transition-all flex items-center">
                    <Trophy className="mr-2 h-4 w-4" />
                    Classifiche
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              {user && (
                <NavigationMenuItem>
                  <Link href="/dashboard" legacyBehavior passHref>
                    <NavigationMenuLink className="px-3 py-2 rounded-lg font-medium hover:bg-[#FF1801] hover:text-white data-[active]:bg-[#FF1801] data-[active]:text-white transition-all flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
              {isAdmin && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="px-3 py-2 rounded-lg font-medium hover:bg-[#FF1801] hover:text-white data-[active]:bg-[#FF1801] data-[active]:text-white transition-all">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[220px] gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                      <li>
                        <Link href="/admin" legacyBehavior passHref>
                          <NavigationMenuLink className="flex p-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                            Dashboard Admin
                          </NavigationMenuLink>
                        </Link>
                      </li>
                      <li>
                        <Link href="/admin/grand-prix" legacyBehavior passHref>
                          <NavigationMenuLink className="flex p-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                            Gestione Gran Premi
                          </NavigationMenuLink>
                        </Link>
                      </li>
                      <li>
                        <Link href="/admin/users" legacyBehavior passHref>
                          <NavigationMenuLink className="flex p-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                            Gestione Utenti
                          </NavigationMenuLink>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <ModeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-[#FF1801] shadow-md hover:shadow-lg transition-all">
                  <Avatar className="h-full w-full">
                    <AvatarImage src="/placeholder.svg" alt={user.email || ""} />
                    <AvatarFallback className="bg-[#FF1801]/10 text-[#FF1801]">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-xl overflow-hidden shadow-lg border-none" align="end" forceMount>
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
                  <Link href="/profile" className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profilo
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center text-[#FF1801] focus:text-[#FF1801] hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="rounded-full px-4 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Accedi
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full px-4 bg-[#FF1801] hover:bg-[#E10600] text-white border-none shadow-md">
                  Registrati
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center md:hidden">
          <ModeToggle />
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 border-l-[#FF1801]">
              <div className="flex flex-col py-4">
                <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700 mb-2">
                  <div className="bg-[#FF1801] text-white p-1.5 rounded-full shadow-sm">
                    <Flag className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-[#FF1801] to-[#E10600] text-transparent bg-clip-text">Formula Guess</span>
                </div>

                <div className="px-2">
                  <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    <div className="flex items-center px-4 py-3 rounded-lg font-medium hover:bg-[#FF1801] hover:text-white transition-all">
                      <Home className="mr-3 h-5 w-5" />
                      Home
                    </div>
                  </Link>
                  
                  <Link href="/leaderboard" onClick={() => setIsMenuOpen(false)}>
                    <div className="flex items-center px-4 py-3 rounded-lg font-medium hover:bg-[#FF1801] hover:text-white transition-all">
                      <Trophy className="mr-3 h-5 w-5" />
                      Classifiche
                    </div>
                  </Link>
                  
                  {user && (
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center px-4 py-3 rounded-lg font-medium hover:bg-[#FF1801] hover:text-white transition-all">
                        <Settings className="mr-3 h-5 w-5" />
                        Dashboard
                      </div>
                    </Link>
                  )}
                </div>

                {isAdmin && (
                  <>
                    <div className="px-4 py-2 mt-2 border-t border-b border-gray-200 dark:border-gray-700">
                      <p className="text-[#FF1801] font-medium text-sm">Admin</p>
                    </div>
                    
                    <div className="px-2">
                      <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                        <div className="flex items-center px-4 py-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                          Dashboard Admin
                        </div>
                      </Link>
                      
                      <Link href="/admin/grand-prix" onClick={() => setIsMenuOpen(false)}>
                        <div className="flex items-center px-4 py-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                          Gestione Gran Premi
                        </div>
                      </Link>
                      
                      <Link href="/admin/users" onClick={() => setIsMenuOpen(false)}>
                        <div className="flex items-center px-4 py-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                          Gestione Utenti
                        </div>
                      </Link>
                    </div>
                  </>
                )}

                <div className="mt-auto px-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                    <div className="flex items-center px-4 py-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                      <User className="mr-3 h-5 w-5" />
                      Profilo
                    </div>
                  </Link>
                  
                  {user && (
                    <div 
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center px-4 py-3 rounded-lg font-medium text-[#FF1801] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Logout
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

