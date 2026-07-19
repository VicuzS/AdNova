import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const UMBRAL_MARGEN = 20
const DIAS_STOCK_MUERTO = 30
const VENTAS_MINIMAS_MENSUALES = 2
const COSTO_IMAGEN_IA = 0.10

export function calcularMargenBruto(precioVenta, costoAdquisicion) {
  if (!precioVenta || precioVenta <= 0) return 0
  return ((precioVenta - costoAdquisicion) / precioVenta) * 100
}

export function calcularDiasEnAlmacen(fechaIngreso) {
  const ahora = new Date()
  const ingreso = new Date(fechaIngreso)
  const diff = ahora.getTime() - ingreso.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function alertaMargen(margen) {
  return margen < UMBRAL_MARGEN
}

export function alertaStockMuerto(diasEnAlmacen, ventasMensuales) {
  return diasEnAlmacen > DIAS_STOCK_MUERTO && ventasMensuales < VENTAS_MINIMAS_MENSUALES
}

export function calcularROAS(totalIngresos, costoCampania) {
  if (!costoCampania || costoCampania <= 0) return 0
  return totalIngresos / costoCampania
}

export async function obtenerVentasMensuales(productoId) {
  const hace30Dias = new Date()
  hace30Dias.setDate(hace30Dias.getDate() - 30)

  const ventas = await prisma.ventaHistorial.count({
    where: {
      productoId,
      fechaVenta: { gte: hace30Dias }
    }
  })
  return ventas
}

export async function generarInsights(productos) {
  const insights = []

  for (const producto of productos) {
    const margen = calcularMargenBruto(producto.precioVenta, producto.costoAdquisicion)
    const diasEnAlmacen = calcularDiasEnAlmacen(producto.fechaIngresoAlmacen)
    const ventasMensuales = await obtenerVentasMensuales(producto.id)

    if (alertaMargen(margen)) {
      insights.push({
        productoId: producto.id,
        producto: producto.nombre,
        alerta: 'Margen en Riesgo',
        detalle: `Margen actual: ${margen.toFixed(1)}% (umbral mínimo: ${UMBRAL_MARGEN}%)`,
        sugerencia: 'Revisar precio de venta o negociar mejor costo de adquisición con proveedores',
        estrategia: 'Optimización de Margen'
      })
    }

    if (alertaStockMuerto(diasEnAlmacen, ventasMensuales)) {
      insights.push({
        productoId: producto.id,
        producto: producto.nombre,
        alerta: 'Stock Muerto / Capital Inmovilizado',
        detalle: `${diasEnAlmacen} días en almacén, solo ${ventasMensuales} venta(s) en el último mes`,
        sugerencia: 'Aplicar descuento del 15% para recuperar liquidez',
        estrategia: 'Liquidación de Stock'
      })
    }
  }

  return insights
}

export async function calcularMetricasDashboard() {
  const productos = await prisma.producto.findMany({
    include: {
      ventasHistorial: true
    }
  })

  const ventasTotales = productos.reduce((sum, p) => {
    return sum + p.ventasHistorial.reduce((s, v) => s + v.cantidad * v.precioAplicado, 0)
  }, 0)

  const margenes = productos.map(p => calcularMargenBruto(p.precioVenta, p.costoAdquisicion))
  const margenPromedio = margenes.length > 0
    ? margenes.reduce((a, b) => a + b, 0) / margenes.length
    : 0

  const capitalInmovilizado = productos.reduce((sum, p) => {
    return sum + (p.stockActual * p.costoAdquisicion)
  }, 0)

  const insights = await generarInsights(productos)

  return {
    ventasTotales: Math.round(ventasTotales * 100) / 100,
    margenPromedio: Math.round(margenPromedio * 100) / 100,
    capitalInmovilizado: Math.round(capitalInmovilizado * 100) / 100,
    totalProductos: productos.length,
    aiInsights: insights
  }
}
