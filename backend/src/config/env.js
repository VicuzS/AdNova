import 'dotenv/config'

export const config = {
  port:          process.env.PORT          || 4000,
  frontendUrl:   process.env.FRONTEND_URL  || 'http://localhost:3000',
  databaseUrl:   process.env.DATABASE_URL  || 'file:./dev.db',
  gemini: {
    apiKey:      process.env.GEMINI_API_KEY,
    model:       'gemini-2.5-flash',
  },
  replicate: {
    apiKey:      process.env.REPLICATE_API_KEY,
    modelImage:  process.env.REPLICATE_MODEL_IMAGE || 'black-forest-labs/flux-schnell',
  }
}
