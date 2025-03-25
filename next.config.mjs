let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ottimizza per la produzione evitando log di sviluppo
  reactStrictMode: true,
  
  // Migliora la gestione di larghe dipendenze condivise
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{member}}",
    },
  },
  
  // Limita i log di hydration mismatch in sviluppo
  onDemandEntries: {
    // Periodo di keep-alive del server (ms)
    maxInactiveAge: 60 * 60 * 1000, // 1 ora
    // Pagine che devono essere sempre tenute in memoria
    pagesBufferLength: 5,
  },
  
  // Configurazione dell'ottimizzazione delle immagini
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ['image/webp'],
  },
  
  // Abilita il caricamento progressivo di moduli
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: ['lucide-react'],
  },
  
  // Impostazioni di ottimizzazione che riducono bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Ottimizzazione per la PWA
  webpack: (config) => {
    // Ottimizzazioni specifiche webpack per migliorare la velocità di caricamento
    config.optimization = {
      ...config.optimization,
      // Assicurati di avere raggruppamenti appropriati
      splitChunks: {
        chunks: 'all',
      },
    };
    
    return config;
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
