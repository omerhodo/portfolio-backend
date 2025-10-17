import { deleteByPublicId, uploadBuffer } from '../config/cloudinary.js'
import Project from '../models/Project.js'

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

// @desc    Get single project by slug
// @route   GET /api/projects/slug/:slug
// @access  Public
export const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug })

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
  let uploadedImagePublicId = null // Cloudinary cleanup için

  try {
    // Multer req.body'yi parse eder
    const projectData = { ...req.body }

    // Boolean ve number değerleri düzelt (FormData string olarak gönderir)
    if (projectData.featured !== undefined) {
      projectData.featured = projectData.featured === 'true' || projectData.featured === true
    }

    if (projectData.order !== undefined) {
      projectData.order = Number(projectData.order)
    }

    // Eğer dosya yüklendiyse, Cloudinary'e yükle
    if (req.file && req.file.buffer) {
      const result = await uploadBuffer(req.file.buffer, 'portfolio')
      projectData.imageUrl = result.secure_url || result.url
      projectData.imagePublicId = result.public_id
      uploadedImagePublicId = result.public_id
    } else {
      console.log('No image file uploaded')
    }

    // Technologies string ise array'e çevir
    if (projectData.technologies && typeof projectData.technologies === 'string') {
      projectData.technologies = projectData.technologies
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech !== '')
    }

    console.log('Final projectData before create:', projectData)

    const project = await Project.create(projectData)
    res.status(201).json(project)
  } catch (error) {
    res.status(400).json({ message: error.message || 'Validation failed' })
  }
}

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Public (should be protected in production)
export const updateProject = async (req, res) => {
  let uploadedImagePublicId = null // Cloudinary cleanup için

  try {
    const oldProject = await Project.findById(req.params.id)

    if (!oldProject) {
      return res.status(404).json({ message: 'Project not found' })
    }

    const updateData = { ...req.body }

    // Eğer yeni dosya yüklendiyse, Cloudinary'e yükle
    if (req.file && req.file.buffer) {
      const result = await uploadBuffer(req.file.buffer, 'portfolio')
      updateData.imageUrl = result.secure_url || result.url
      updateData.imagePublicId = result.public_id
      uploadedImagePublicId = result.public_id // Cleanup için sakla

      // Eski Cloudinary görüntüsünü sil
      if (oldProject.imagePublicId) {
        await deleteByPublicId(oldProject.imagePublicId)
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
    // Eğer yeni görsel yüklendiyse ve hata olursa, Cloudinary'den sil
    if (req.file && uploadedImagePublicId) {
      try {
        await deleteByPublicId(uploadedImagePublicId)
      } catch (deleteErr) {
        console.error('Cloudinary cleanup failed:', deleteErr)
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

    // Proje silinirken Cloudinary'deki görseli de sil
    if (project.imagePublicId) {
      try {
        await deleteByPublicId(project.imagePublicId)
      } catch (deleteErr) {
        console.error('Cloudinary cleanup failed:', deleteErr)
      }
    }

    res.json({ message: 'Project removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
