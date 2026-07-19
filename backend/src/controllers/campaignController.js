import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { config } from '../config/env.js'
import prisma from '../config/prisma.js'
import Replicate from 'replicate'
import {
  calcularMargenBruto,
  calcularDiasEnAlmacen,
  obtenerVentasMensuales,
  alertaMargen,
  alertaStockMuerto
} from '../engine/economyEngine.js'

const replicate = new Replicate({ auth: config.replicate.apiKey })

function generarCopy(producto, estrategia, descuento) {
  const copies = {
    'Liquidación de Stock': `¡Últimas unidades! ${producto} con ${descuento}% de descuento. Stock limitado, no dejes pasar esta oportunidad. Aprovecha el precio más bajo del año.`,
    'Optimización de Margen': `${producto} al mejor precio del mercado. Calidad premium que tu negocio merece. Compra ahora con envío gratis.`
  }
  return copies[estrategia] || `Aprovecha nuestra oferta especial en ${producto}.`
}

export async function generateCampaign(req, res, next) {
  try {
    const { productoId, estrategia } = req.body

    if (!productoId || !estrategia) {
      return res.status(400).json({ error: 'Los campos "productoId" y "estrategia" son obligatorios' })
    }

    const producto = await prisma.producto.findUnique({ where: { id: productoId } })
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    const margen = calcularMargenBruto(producto.precioVenta, producto.costoAdquisicion)
    const diasEnAlmacen = calcularDiasEnAlmacen(producto.fechaIngresoAlmacen)
    const ventasMensuales = await obtenerVentasMensuales(producto.id)

    const descuento = estrategia === 'Liquidación de Stock' ? 15 : 5
    const copyTexto = generarCopy(producto.nombre, estrategia, descuento)
    const codigoTracking = `CAMP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    let imagenGeneradaUrl = null

    const campana = await prisma.campana.create({
      data: {
        productoId,
        tipoEstrategia: estrategia,
        descuentoAplicado: descuento,
        imagenGeneradaUrl,
        copyTexto,
        codigoTrackingWhatsapp: codigoTracking
      },
      include: {
        producto: { select: { nombre: true, sku: true } }
      }
    })

    res.status(201).json({
      ok: true,
      campana,
      analisis: {
        producto: producto.nombre,
        margenActual: `${margen.toFixed(1)}%`,
        diasEnAlmacen,
        ventasMensuales,
        alertaMargen: alertaMargen(margen),
        alertaStockMuerto: alertaStockMuerto(diasEnAlmacen, ventasMensuales)
      }
    })
  } catch (err) {
    next(err)
  }
}

export async function listCampaigns(req, res, next) {
  try {
    const campanas = await prisma.campana.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        producto: { select: { id: true, nombre: true, sku: true } },
        _count: { select: { ventas: true } }
      }
    })

    res.json(campanas)
  } catch (err) {
    next(err)
  }
}

export async function getCampaignDetail(req, res, next) {
  try {
    const id = parseInt(req.params.id)
    const campana = await prisma.campana.findUnique({
      where: { id },
      include: {
        producto: { select: { nombre: true, sku: true, fotoOriginalUrl: true } },
        ventas: {
          orderBy: { fechaVenta: 'desc' },
          take: 20
        }
      }
    })

    if (!campana) {
      return res.status(404).json({ error: 'Campaña no encontrada' })
    }

    res.json(campana)
  } catch (err) {
    next(err)
  }
}

export async function deleteCampaign(req, res, next) {
  try {
    const id = parseInt(req.params.id)
    const campana = await prisma.campana.findUnique({ where: { id } })
    if (!campana) {
      return res.status(404).json({ error: 'Campaña no encontrada' })
    }
    await prisma.campana.delete({ where: { id } })
    res.json({ ok: true, mensaje: 'Campaña eliminada' })
  } catch (err) {
    next(err)
  }
}

export async function generateBanner(req, res, next) {
  try {
    const id = parseInt(req.params.id)
    const campana = await prisma.campana.findUnique({
      where: { id },
      include: { producto: { select: { nombre: true, sku: true } } }
    })

    if (!campana) {
      return res.status(404).json({ error: 'Campaña no encontrada' })
    }

    if (!config.replicate.apiKey || config.replicate.apiKey.includes('xxxx')) {
      return res.status(400).json({ error: 'REPLICATE_API_KEY no configurada' })
    }

    const copyTexto = req.body.copyTexto || campana.copyTexto || ''
    const descuento = campana.descuentoAplicado || 15

    let imageInput = null
    if (req.file) {
      const b64 = req.file.buffer.toString('base64')
      imageInput = `data:${req.file.mimetype};base64,${b64}`
    }

    const productDesc = imageInput
      ? ''
      : `The product "${campana.producto.nombre}" (SKU: ${campana.producto.sku})`

    const prompt = `Professional e-commerce product photography of ${productDesc || campana.producto.nombre}. High quality commercial shot, clean white background, studio lighting, sharp focus, 8k detailed texture, minimalist style, no text, no letters, no words, no graphics, just the product on a clean background.${imageInput ? ' Use the provided image as exact reference for the product appearance.' : ''}`

    const output = await replicate.run('ideogram-ai/ideogram-v3-turbo', {
      input: {
        prompt,
        aspect_ratio: '1:1',
        style_type: 'Realistic',
        magic_prompt_option: 'Off',
      }
    })

    const imageUrl = typeof output === 'string' ? output : output?.url?.()

    if (!imageUrl) {
      return res.status(500).json({ error: 'Replicate no devolvió una URL de imagen' })
    }

    if (!existsSync('uploads')) mkdirSync('uploads')
    const filename = `banner-${Date.now()}.png`
    const imageResp = await fetch(imageUrl)
    if (!imageResp.ok) throw new Error(`Error descargando imagen: ${imageResp.status}`)
    const buffer = Buffer.from(await imageResp.arrayBuffer())
    writeFileSync(`uploads/${filename}`, buffer)

    const updated = await prisma.campana.update({
      where: { id },
      data: { imagenGeneradaUrl: `/uploads/${filename}` },
      include: { producto: { select: { nombre: true, sku: true } } }
    })

    res.json({ ok: true, imagenGeneradaUrl: updated.imagenGeneradaUrl, campana: updated })
  } catch (err) {
    next(err)
  }
}
