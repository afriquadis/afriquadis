/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration de base optimisée
  swcMinify: true,
  
  // Images optimisées
  images: {
    domains: ['afriquadis.com', 'bilan-express.afriquadis.com', 'cdn.afriquadis.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers de sécurité de base
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configuration webpack optimisée pour résoudre les problèmes de chunks
  webpack: (config, { dev, isServer }) => {
    // Optimisations pour résoudre les problèmes de chunks
    if (!isServer) {
      // Configuration des chunks pour éviter les erreurs de chargement
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -30,
            reuseExistingChunk: true,
          },
        },
      };
      
      // Configuration du runtime pour éviter les erreurs de chunks
      config.optimization.runtimeChunk = {
        name: 'runtime',
      };
      
      // Amélioration de la gestion des erreurs de chunks
      config.output.chunkLoadingGlobal = 'webpackChunkload';
      config.output.globalObject = 'self';
    }
    
    // Optimisations de production
    if (!dev) {
      config.optimization.minimize = true;
    }
    
    return config;
  },
  
  // Désactiver les optimisations expérimentales problématiques
  experimental: {
    // optimizeCss: false, // Désactivé temporairement
    // scrollRestoration: false, // Désactivé temporairement
  },
  
  // Configuration de base
  trailingSlash: false,
  generateEtags: true,
  
  // Amélioration de la stabilité des chunks
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Configuration du bundling pour éviter les erreurs de chunks
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
