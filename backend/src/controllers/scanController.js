import { config } from '../config/env.js'
import { GoogleGenAI } from '@google/genai'

const MARGEN_SUGERIDO = 1.3

export async function scanInvoice(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Debes subir una imagen de factura (campo "invoice")' })
    }

    if (!config.gemini.apiKey || config.gemini.apiKey.trim() === '') {
      return res.status(400).json({
        error: 'GEMINI_API_KEY no configurada',
        instruccion: 'Agrega tu API Key en backend/.env. Consíguela gratis en https://aistudio.google.com/app/apikey'
      })
    }

    const base64Image = req.file.buffer.toString('base64')
    const mimeType = req.file.mimetype || 'image/jpeg'

    const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey })

    const prompt = `Analiza rigurosamente la imagen de esta factura o nota de compra de proveedor.
Extrae cada uno de los productos adquiridos, sus cantidades correspondientes y su costo de adquisición unitario neto (sin impuestos).
Limpia los nombres de los productos eliminando códigos innecesarios al principio.

Para cada producto, calcula también un PRECIO_DE_VENTA_SUGERIDO multiplicando el costo de adquisición por ${MARGEN_SUGERIDO} (margen del 30%).

Devuelve SOLO un objeto JSON con esta estructura exacta, sin texto adicional:
{
  "productos": [
    {
      "nombre": "Nombre limpio del producto",
      "sku": "Si la factura tiene código usa ese, si no genera uno corto basado en el nombre ej: LAM-001",
      "cantidad": (número entero de unidades),
      "costo_adquisicion": (número, costo unitario),
      "precio_venta_sugerido": (número, costo × ${MARGEN_SUGERIDO})
    }
  ]
}`

    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ]

    const response = await ai.models.generateContent({
      model: config.gemini.model,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            productos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  nombre:                { type: 'string' },
                  sku:                   { type: 'string' },
                  cantidad:              { type: 'integer' },
                  costo_adquisicion:     { type: 'number' },
                  precio_venta_sugerido: { type: 'number' },
                },
                required: ['nombre', 'sku', 'cantidad', 'costo_adquisicion', 'precio_venta_sugerido'],
              },
            },
          },
          required: ['productos'],
        },
      },
    })

    const text = response.text

    if (!text) {
      return res.status(500).json({ error: 'Gemini no devolvió contenido' })
    }

    const parsed = JSON.parse(text)

    if (!parsed.productos || parsed.productos.length === 0) {
      return res.status(422).json({ error: 'No se pudieron extraer productos de la factura', raw: text })
    }

    res.json({
      success: true,
      data: parsed.productos,
      proveedor: req.body.proveedor || null,
    })

  } catch (err) {
    if (err.name === 'JSONError' || err.name === 'SyntaxError') {
      return res.status(422).json({ error: 'Error parseando respuesta de Gemini', raw: err.message })
    }
    next(err)
  }
}
