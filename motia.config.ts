import { config } from 'motia'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Parse Redis configuration from environment
 * Automatically uses Redis in production or when USE_REDIS=true
 */
const getRedisConfig = () => {
  const useExternalRedis =
    process.env.USE_REDIS === 'true' ||
    (process.env.USE_REDIS !== 'false' && process.env.NODE_ENV === 'production')

  if (!useExternalRedis) {
    return null
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

  try {
    const url = new URL(redisUrl)
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password || undefined,
      db: url.pathname ? parseInt(url.pathname.slice(1)) : 0
    }
  } catch (error) {
    console.error('Invalid REDIS_URL format:', error)
    return null
  }
}

const redisConfig = getRedisConfig()

export default config({
  plugins: [],

  // Configure Redis adapters for production scaling
  ...(redisConfig && {
    redis: redisConfig
  }),

  // Express app customization for static files and health check
  app: (app) => {
    // CORS middleware for cross-origin requests from Vercel frontend
    app.use((req, res, next) => {
      const allowedOrigins = [
        'https://manim-video-generator-taupe.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
      ]
      const origin = req.headers.origin
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin)
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
      }
      next()
    })

    // Health check endpoint for Docker/Kubernetes/Zeabur
    app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        redis: redisConfig ? 'enabled' : 'disabled',
        environment: process.env.NODE_ENV || 'development'
      })
    })

    // Serve static files from public directory
    app.use(express.static(path.join(__dirname, 'public')))

    // Serve generated videos
    app.use('/videos', express.static(path.join(__dirname, 'public', 'videos')))

    // SPA fallback - serve index.html for non-API routes
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return next()
      }
      res.sendFile(path.join(__dirname, 'public', 'index.html'))
    })
  }
})
