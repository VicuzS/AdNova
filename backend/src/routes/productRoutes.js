import { Router } from 'express'
import {
  listProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js'

const router = Router()

router.get('/', listProducts)
router.post('/', createProduct)
router.get('/:id', getProductDetail)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router
