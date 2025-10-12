import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { existsSync } from 'fs'
import morgan from 'morgan'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import projectRoutes from './routes/projectRoutes.js'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables with fallback
const NODE_ENV = process.env.NODE_ENV || 'development'
const envFile = `.env.${NODE_ENV}.local`
const envPath = resolve(__dirname, '..', envFile)

// Check if env file exists, fallback to .env
if (existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log(`✅ Loaded environment from ${envFile}`)
} else {
  dotenv.config()
  console.warn(`⚠️  ${envFile} not found, using default .env`)
}

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://xhodo.com',
  'https://www.xhodo.com'
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Portfolio API is running',
    environment: NODE_ENV,
    status: 'healthy'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} in ${NODE_ENV} mode`)
})
