import prisma from '../config/prisma.js'
import {
  calcularMargenBruto,
  calcularDiasEnAlmacen,
  obtenerVentasMensuales,
  alertaMargen,
  alertaStockMuerto
} from '../engine/economyEngine.js'

const SELECT_BASIC = {
  id: true,
  nombre: true,
  sku: true,
  fotoOriginalUrl: true,
  costoAdquisicion: true,
  precioVenta: true,
  stockActual: true,
  fechaIngresoAlmacen: true,
  createdAt: true,
  updatedAt: true,
}

export async function listProducts(req, res, next) {
  try {
    const productos = await prisma.producto.findMany({
      select: SELECT_BASIC,
      orderBy: { createdAt: 'desc' }
    })

    const result = await Promise.all(productos.map(async (p) => {
      const margen = calcularMargenBruto(p.precioVenta, p.costoAdquisicion)
      const diasEnAlmacen = calcularDiasEnAlmacen(p.fechaIngresoAlmacen)
      const ventasMensuales = await obtenerVentasMensuales(p.id)

      return {
        ...p,
        margen: Math.round(margen * 100) / 100,
        diasEnAlmacen,
        ventasMensuales,
        alertas: {
          margenRiesgo: alertaMargen(margen),
          stockMuerto: alertaStockMuerto(diasEnAlmacen, ventasMensuales)
        }
      }
    }))

    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getProductDetail(req, res, next) {
  try {
    const id = parseInt(req.params.id)
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        ventasHistorial: {
          orderBy: { fechaVenta: 'desc' },
          take: 20,
          include: {
            campana: { select: { tipoEstrategia: true, codigoTrackingWhatsapp: true } }
          }
        },
        campanas: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { ventas: true } }
          }
        }
      }
    })

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    const margen = calcularMargenBruto(producto.precioVenta, producto.costoAdquisicion)
    const diasEnAlmacen = calcularDiasEnAlmacen(producto.fechaIngresoAlmacen)
    const ventasMensuales = await obtenerVentasMensuales(producto.id)

    res.json({
      ...producto,
      margen: Math.round(margen * 100) / 100,
      diasEnAlmacen,
      ventasMensuales,
      alertas: {
        margenRiesgo: alertaMargen(margen),
        stockMuerto: alertaStockMuerto(diasEnAlmacen, ventasMensuales)
      }
    })
  } catch (err) {
    next(err)
  }
}

export async function createProduct(req, res, next) {
  try {
    const { nombre, sku, costoAdquisicion, precioVenta, stockActual, fotoOriginalUrl } = req.body

    if (!nombre || !sku || costoAdquisicion == null || precioVenta == null || stockActual == null) {
      return res.status(400).json({ error: 'Los campos nombre, sku, costoAdquisicion, precioVenta y stockActual son obligatorios' })
    }

    const existente = await prisma.producto.findUnique({ where: { sku } })
    if (existente) {
      return res.status(409).json({ error: `Ya existe un producto con el SKU "${sku}"` })
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        sku,
        costoAdquisicion: parseFloat(costoAdquisicion),
        precioVenta: parseFloat(precioVenta),
        stockActual: parseInt(stockActual),
        fotoOriginalUrl: fotoOriginalUrl || null,
        fechaIngresoAlmacen: new Date(),
      }
    })

    res.status(201).json(producto)
  } catch (err) {
    next(err)
  }
}

export async function updateProduct(req, res, next) {
  try {
    const id = parseInt(req.params.id)
    const { nombre, sku, costoAdquisicion, precioVenta, stockActual, fotoOriginalUrl } = req.body

    const producto = await prisma.producto.findUnique({ where: { id } })
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    if (sku && sku !== producto.sku) {
      const existente = await prisma.producto.findUnique({ where: { sku } })
      if (existente) {
        return res.status(409).json({ error: `Ya existe otro producto con el SKU "${sku}"` })
      }
    }

    const actualizado = await prisma.producto.update({
      where: { id },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(sku !== undefined && { sku }),
        ...(costoAdquisicion !== undefined && { costoAdquisicion: parseFloat(costoAdquisicion) }),
        ...(precioVenta !== undefined && { precioVenta: parseFloat(precioVenta) }),
        ...(stockActual !== undefined && { stockActual: parseInt(stockActual) }),
        ...(fotoOriginalUrl !== undefined && { fotoOriginalUrl }),
      }
    })

    const margen = calcularMargenBruto(actualizado.precioVenta, actualizado.costoAdquisicion)
    const diasEnAlmacen = calcularDiasEnAlmacen(actualizado.fechaIngresoAlmacen)
    const ventasMensuales = await obtenerVentasMensuales(actualizado.id)

    res.json({
      ...actualizado,
      margen: Math.round(margen * 100) / 100,
      diasEnAlmacen,
      ventasMensuales,
      alertas: {
        margenRiesgo: alertaMargen(margen),
        stockMuerto: alertaStockMuerto(diasEnAlmacen, ventasMensuales)
      }
    })
  } catch (err) {
    next(err)
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const id = parseInt(req.params.id)

    const producto = await prisma.producto.findUnique({ where: { id } })
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    await prisma.ventaHistorial.deleteMany({ where: { productoId: id } })
    await prisma.campana.deleteMany({ where: { productoId: id } })
    await prisma.producto.delete({ where: { id } })

    res.json({ ok: true, mensaje: `Producto "${producto.nombre}" eliminado` })
  } catch (err) {
    next(err)
  }
}
