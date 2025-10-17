import express from 'express'
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectBySlug,
  getProjects,
  updateProject
} from '../controllers/projectController.js'
import { admin, protect } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

// Debug middleware
const debugMulter = (req, res, next) => {
  console.log('Before Multer - Content-Type:', req.headers['content-type'])
  next()
}

router.route('/')
  .get(getProjects)
  .post(protect, admin, debugMulter, upload.single('image'), createProject)

router.route('/slug/:slug')
  .get(getProjectBySlug)

router.route('/:id')
  .get(getProjectById)
  .put(protect, admin, upload.single('image'), updateProject)
  .delete(protect, admin, deleteProject)

export default router
