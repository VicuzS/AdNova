import { Router } from 'express'
import { registerSale, getSalesHistory } from '../controllers/salesController.js'

const router = Router()

router.post('/register', registerSale)
router.get('/history', getSalesHistory)

export default router
