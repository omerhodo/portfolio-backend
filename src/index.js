import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import projectRoutes from './routes/projectRoutes.js'

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production.local'
  : '.env.development.local'

dotenv.config({ path: envFile })

const app = express()
const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Connect to MongoDB
connectDB()

// Middleware
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5000',
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
