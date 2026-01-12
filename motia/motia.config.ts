import { config } from 'motia'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default config({
  plugins: [],
  adapters: {},

  // Express app customization for static files and health check
  app: (app) => {
    // Health check endpoint for Docker/Kubernetes
    app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() })
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
