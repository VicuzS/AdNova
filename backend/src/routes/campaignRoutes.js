import { Router } from 'express'
import multer from 'multer'
import { generateCampaign, listCampaigns, getCampaignDetail, deleteCampaign, generateBanner } from '../controllers/campaignController.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const tipos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (tipos.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Solo se aceptan imágenes .jpg, .png o .webp'))
    }
  },
})

router.post('/generate', generateCampaign)
router.get('/list', listCampaigns)
router.get('/:id', getCampaignDetail)
router.delete('/:id', deleteCampaign)
router.post('/:id/generate-banner', upload.single('productImage'), generateBanner)

export default router
