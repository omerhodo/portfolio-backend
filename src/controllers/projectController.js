import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Project from '../models/Project.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create new project
// @route   POST /api/projects
// @access  Public (should be protected in production)
export const createProject = async (req, res) => {
  try {
    console.log('Request body:', req.body)

    // Multer req.body'yi parse eder
    const projectData = { ...req.body }

    // Boolean ve number değerleri düzelt (FormData string olarak gönderir)
    if (projectData.featured !== undefined) {
      projectData.featured = projectData.featured === 'true' || projectData.featured === true
    }

    if (projectData.order !== undefined) {
      projectData.order = Number(projectData.order)
    }

    // Eğer dosya yüklendiyse, imagePath'i kaydet
    if (req.file) {
      projectData.imagePath = `/uploads/${req.file.filename}`
    }

    // Technologies string ise array'e çevir
    if (projectData.technologies && typeof projectData.technologies === 'string') {
      projectData.technologies = projectData.technologies
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech !== '')
    }

    const project = await Project.create(projectData)
    res.status(201).json(project)
  } catch (error) {
    // Hata olursa yüklenen dosyayı sil
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads', req.file.filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
    res.status(400).json({ message: error.message })
  }
}

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Public (should be protected in production)
export const updateProject = async (req, res) => {
  try {
    const oldProject = await Project.findById(req.params.id)

    if (!oldProject) {
      return res.status(404).json({ message: 'Project not found' })
    }

    const updateData = { ...req.body }

    // Eğer yeni dosya yüklendiyse
    if (req.file) {
      updateData.imagePath = `/uploads/${req.file.filename}`

      // Eski dosyayı sil
      if (oldProject.imagePath) {
        const oldFilePath = path.join(__dirname, '../../', oldProject.imagePath)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }
    }

    // Technologies string ise array'e çevir
    if (typeof updateData.technologies === 'string') {
      updateData.technologies = updateData.technologies
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech !== '')
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    res.json(project)
  } catch (error) {
    // Hata olursa yeni yüklenen dosyayı sil
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads', req.file.filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
    res.status(400).json({ message: error.message })
  }
}

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Public (should be protected in production)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Proje silinirken ilişkili görseli de sil
    if (project.imagePath) {
      const filePath = path.join(__dirname, '../../', project.imagePath)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    res.json({ message: 'Project removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
