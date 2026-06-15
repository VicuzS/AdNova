import { config } from '../config/env.js'
import Replicate from 'replicate'
import fs from 'fs'

const replicate = new Replicate({ auth: config.replicate.apiKey })

function construirPrompt({ producto, estilo, plataforma, duracion }) {
  const estiloMap = {
    'Cinematográfico': 'cinematic, dramatic lighting, film look',
    'Minimalista':     'minimalist, clean, white background, elegant',
    'Dinámico':        'dynamic, fast cuts, energetic, bold colors',
    'Lifestyle':       'lifestyle, natural light, real people, authentic',
  }

  const estiloEn = estiloMap[estilo] || 'professional, high quality'
  return `Advertisement video for "${producto}". Style: ${estiloEn}. Platform: ${plataforma}. Short ${duracion} ad, product showcase, commercial quality.`
}

async function descargarVideo(url) {
  const respuesta = await fetch(url)
  if (!respuesta.ok) throw { status: 500, message: 'Error al descargar el video generado' }
  return Buffer.from(await respuesta.arrayBuffer())
}

export async function generarDesdeTexto(req, res, next) {
  try {
    const { producto, estilo, plataforma, duracion } = req.body

    if (!producto) {
      return res.status(400).json({ error: 'El campo "producto" es obligatorio' })
    }

    const prompt = construirPrompt({ producto, estilo, plataforma, duracion })
    console.log(' Generando video desde texto:', prompt)

    const output = await replicate.run(config.replicate.modelText, {
      input: { prompt, prompt_optimizer: true }
    })

    const videoUrl = typeof output === 'string' ? output : output.url()
    const videoBuffer = await descargarVideo(videoUrl)

    res.json({
      ok: true,
      video: videoBuffer.toString('base64'),
      tipo: 'video/mp4',
      prompt,
    })

  } catch (err) {
    next(err)
  }
}

export async function generarDesdeImagen(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Debes subir una imagen (.png, .jpg, .webp)' })
    }

    const { producto } = req.body
    const imagenBuffer = fs.readFileSync(req.file.path)
    const base64Image = imagenBuffer.toString('base64')
    const dataUri = `data:${req.file.mimetype};base64,${base64Image}`

    console.log('  Generando video desde imagen:', req.file.originalname)
    console.log('   Producto:', producto)

    const output = await replicate.run(config.replicate.modelImg, {
      input: {
        first_frame_image: dataUri,
        prompt: producto || 'animation',
        prompt_optimizer: true,
      }
    })

    fs.unlinkSync(req.file.path)

    const videoUrl = typeof output === 'string' ? output : output.url()
    const videoBuffer = await descargarVideo(videoUrl)

    res.json({
      ok: true,
      video: videoBuffer.toString('base64'),
      tipo: 'video/mp4',
    })

  } catch (err) {
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path) } catch {}
    }
    next(err)
  }
}

export async function estadoModelo(req, res, next) {
  res.json({ listo: true, mensaje: 'Modelo disponible (Replicate)' })
}
