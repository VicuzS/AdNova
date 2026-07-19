import express from 'express'
import cors from 'cors'
import { config } from './config/env.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import campaignRoutes from './routes/campaignRoutes.js'
import salesRoutes from './routes/salesRoutes.js'
import productRoutes from './routes/productRoutes.js'
import scanRoutes from './routes/scanRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors({
  origin: config.frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.get('/', (req, res) => {
  res.redirect(config.frontendUrl)
})

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'AdNova.ai - CFO de Bolsillo corriendo',
    motor: 'Económico Online',
    bannerGen: 'SVG dinámico (sin costo)',
  })
})

app.use('/api/dashboard', dashboardRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/inventory', scanRoutes)
app.use('/api/products', productRoutes)

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` })
})

app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`\n AdNova.ai Backend corriendo en http://localhost:${config.port}`)
  console.log(`   Endpoints:`)
  console.log(`     GET  /api/dashboard/metrics`)
  console.log(`     GET  /api/products`)
  console.log(`     GET  /api/products/:id`)
  console.log(`     POST /api/inventory/scan-invoice  (multipart, campo: invoice)`)
  console.log(`     POST /api/campaigns/generate`)
  console.log(`     POST /api/sales/register`)
  console.log(`     GET  /api/sales/history`)
  console.log(`     GET  /health\n`)
})
