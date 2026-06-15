import 'dotenv/config'

const requeridas = ['REPLICATE_API_KEY']

for (const variable of requeridas) {
  if (!process.env[variable] || process.env[variable].includes('xxxx')) {
    console.warn(`   Variable de entorno faltante o sin configurar: ${variable}`)
    console.warn(`   Edita el archivo backend/.env con tu key real de Replicate`)
    console.warn(`   https://replicate.com/account/api-tokens\n`)
  }
}

export const config = {
  port:          process.env.PORT          || 4000,
  frontendUrl:   process.env.FRONTEND_URL  || 'http://localhost:3000',
  replicate: {
    apiKey:      process.env.REPLICATE_API_KEY,
    modelText:   process.env.REPLICATE_MODEL_TEXT || 'minimax/video-01',
    modelImg:    process.env.REPLICATE_MODEL_IMG  || 'minimax/video-01',
  }
}
