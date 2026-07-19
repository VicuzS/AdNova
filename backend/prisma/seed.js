import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando datos mock...')

  await prisma.ventaHistorial.deleteMany()
  await prisma.campana.deleteMany()
  await prisma.producto.deleteMany()

  const hace40Dias = new Date()
  hace40Dias.setDate(hace40Dias.getDate() - 40)

  const hace20Dias = new Date()
  hace20Dias.setDate(hace20Dias.getDate() - 20)

  const hace5Dias = new Date()
  hace5Dias.setDate(hace5Dias.getDate() - 5)

  const productoMoroso = await prisma.producto.create({
    data: {
      nombre: 'Lámpara LED Escritorio',
      sku: 'LED-001',
      fotoOriginalUrl: 'https://picsum.photos/seed/lampara/400/400',
      costoAdquisicion: 25.00,
      precioVenta: 45.00,
      stockActual: 50,
      fechaIngresoAlmacen: hace40Dias,
    }
  })

  const productoMargenRiesgo = await prisma.producto.create({
    data: {
      nombre: 'Cargador USB-C 20W',
      sku: 'USB-20W-001',
      fotoOriginalUrl: 'https://picsum.photos/seed/cargador/400/400',
      costoAdquisicion: 18.00,
      precioVenta: 20.00,
      stockActual: 120,
      fechaIngresoAlmacen: hace20Dias,
    }
  })

  const productoSaludable = await prisma.producto.create({
    data: {
      nombre: 'Auriculares Bluetooth Pro',
      sku: 'AUDIO-BT-002',
      fotoOriginalUrl: 'https://picsum.photos/seed/auriculares/400/400',
      costoAdquisicion: 80.00,
      precioVenta: 199.00,
      stockActual: 15,
      fechaIngresoAlmacen: hace5Dias,
    }
  })

  const productoSinStock = await prisma.producto.create({
    data: {
      nombre: 'Funda iPhone 15 Silicona',
      sku: 'FND-IP15-001',
      fotoOriginalUrl: 'https://picsum.photos/seed/funda/400/400',
      costoAdquisicion: 5.00,
      precioVenta: 15.00,
      stockActual: 0,
      fechaIngresoAlmacen: hace20Dias,
    }
  })

  const campanaLiquidacion = await prisma.campana.create({
    data: {
      productoId: productoMoroso.id,
      tipoEstrategia: 'Liquidación de Stock',
      descuentoAplicado: 15,
      imagenGeneradaUrl: 'https://picsum.photos/seed/campana1/400/400',
      copyTexto: '¡Últimas unidades! Lámpara LED Escritorio con 15% de descuento. Stock limitado.',
      codigoTrackingWhatsapp: 'CAMP-LIQUIDACION-001',
    }
  })

  const campanaMargen = await prisma.campana.create({
    data: {
      productoId: productoMargenRiesgo.id,
      tipoEstrategia: 'Optimización de Margen',
      descuentoAplicado: 5,
      imagenGeneradaUrl: 'https://picsum.photos/seed/campana2/400/400',
      copyTexto: 'Cargador USB-C 20W al mejor precio. Calidad premium para tu negocio.',
      codigoTrackingWhatsapp: 'CAMP-MARGEN-001',
    }
  })

  const hace15Dias = new Date()
  hace15Dias.setDate(hace15Dias.getDate() - 15)

  const hace10Dias = new Date()
  hace10Dias.setDate(hace10Dias.getDate() - 10)

  const hace3Dias = new Date()
  hace3Dias.setDate(hace3Dias.getDate() - 3)

  await prisma.ventaHistorial.createMany({
    data: [
      {
        productoId: productoMoroso.id,
        campanaId: campanaLiquidacion.id,
        cantidad: 1,
        precioAplicado: 38.25,
        fechaVenta: hace3Dias,
        origen: 'WhatsApp',
      },
      {
        productoId: productoSaludable.id,
        cantidad: 2,
        precioAplicado: 199.00,
        fechaVenta: hace3Dias,
        origen: 'WhatsApp',
      },
      {
        productoId: productoSaludable.id,
        cantidad: 1,
        precioAplicado: 199.00,
        fechaVenta: hace10Dias,
        origen: 'WhatsApp',
      },
      {
        productoId: productoSaludable.id,
        cantidad: 3,
        precioAplicado: 179.10,
        fechaVenta: hace15Dias,
        origen: 'WhatsApp',
      },
      {
        productoId: productoMargenRiesgo.id,
        campanaId: campanaMargen.id,
        cantidad: 5,
        precioAplicado: 19.00,
        fechaVenta: hace10Dias,
        origen: 'WhatsApp',
      },
      {
        productoId: productoSinStock.id,
        cantidad: 1,
        precioAplicado: 15.00,
        fechaVenta: hace15Dias,
        origen: 'WhatsApp',
      },
    ]
  })

  console.log('✅ Datos sembrados correctamente')
  console.log('')
  console.log('📦 Productos:')
  console.log(`   - ${productoMoroso.nombre} (SKU: ${productoMoroso.sku}) — 40 días, 1 venta → Stock Muerto`)
  console.log(`   - ${productoMargenRiesgo.nombre} (SKU: ${productoMargenRiesgo.sku}) — Margen: 10% → Margen en Riesgo`)
  console.log(`   - ${productoSaludable.nombre} (SKU: ${productoSaludable.sku}) — Producto saludable`)
  console.log(`   - ${productoSinStock.nombre} (SKU: ${productoSinStock.sku}) — Sin stock`)
  console.log('')
  console.log('📢 Campañas:')
  console.log(`   - "${campanaLiquidacion.tipoEstrategia}" → ${productoMoroso.nombre}`)
  console.log(`   - "${campanaMargen.tipoEstrategia}" → ${productoMargenRiesgo.nombre}`)
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
