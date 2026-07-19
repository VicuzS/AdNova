import prisma from '../config/prisma.js'
import { calcularROAS } from '../engine/economyEngine.js'

export async function registerSale(req, res, next) {
  try {
    const { productoId, cantidad, precioAplicado, origen, codigoTrackingWhatsapp } = req.body

    if (!productoId || !cantidad || !precioAplicado) {
      return res.status(400).json({ error: 'Los campos "productoId", "cantidad" y "precioAplicado" son obligatorios' })
    }

    const producto = await prisma.producto.findUnique({ where: { id: productoId } })
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    if (producto.stockActual < cantidad) {
      return res.status(400).json({ error: `Stock insuficiente. Disponible: ${producto.stockActual}` })
    }

    let campanaId = null
    let roasCalculado = null

    if (codigoTrackingWhatsapp) {
      const campana = await prisma.campana.findUnique({
        where: { codigoTrackingWhatsapp: codigoTrackingWhatsapp }
      })
      if (campana) {
        campanaId = campana.id
      }
    }

    const venta = await prisma.ventaHistorial.create({
      data: {
        productoId,
        campanaId,
        cantidad,
        precioAplicado,
        origen: origen || 'WhatsApp'
      }
    })

    await prisma.producto.update({
      where: { id: productoId },
      data: { stockActual: producto.stockActual - cantidad }
    })

    if (campanaId) {
      const ventasCampana = await prisma.ventaHistorial.findMany({
        where: { campanaId }
      })

      const totalIngresos = ventasCampana.reduce((sum, v) => sum + v.cantidad * v.precioAplicado, 0)
      const numImagenes = await prisma.campana.count({ where: { id: campanaId } })
      const costoCampania = numImagenes * 0.10

      roasCalculado = calcularROAS(totalIngresos, costoCampania)
    }

    res.status(201).json({
      ok: true,
      venta,
      stockRestante: producto.stockActual - cantidad,
      roas: roasCalculado ? Math.round(roasCalculado * 100) / 100 : null
    })
  } catch (err) {
    next(err)
  }
}

export async function getSalesHistory(req, res, next) {
  try {
    const { productoId, campanaId } = req.query

    const where = {}
    if (productoId) where.productoId = parseInt(productoId)
    if (campanaId) where.campanaId = parseInt(campanaId)

    const ventas = await prisma.ventaHistorial.findMany({
      where,
      include: {
        producto: { select: { nombre: true, sku: true } },
        campana: { select: { tipoEstrategia: true, codigoTrackingWhatsapp: true } }
      },
      orderBy: { fechaVenta: 'desc' }
    })

    res.json(ventas)
  } catch (err) {
    next(err)
  }
}
