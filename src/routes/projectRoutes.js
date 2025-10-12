import express from 'express'
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject
} from '../controllers/projectController.js'
import { admin, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')
  .get(getProjects)
  .post(protect, admin, createProject)

router.route('/:id')
  .get(getProjectById)
  .put(protect, admin, updateProject)
  .delete(protect, admin, deleteProject)

export default router
