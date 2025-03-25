import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Funzione che controlla se il dispositivo è mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Throttle per evitare troppe chiamate durante il resize
    let resizeTimeout: NodeJS.Timeout | null = null
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      resizeTimeout = setTimeout(() => {
        checkMobile()
      }, 100)
    }
    
    // Controlla inizialmente e aggiunge un event listener per i cambiamenti
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", handleResize)
    
    // Aggiungi anche un event listener per il resize della finestra
    window.addEventListener("resize", handleResize)
    
    // Imposta il valore iniziale
    checkMobile()
    
    // Cleanup
    return () => {
      mql.removeEventListener("change", handleResize)
      window.removeEventListener("resize", handleResize)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
  }, [])

  // Se è undefined (durante SSR), assumiamo che non sia mobile
  return isMobile === undefined ? false : isMobile
}
