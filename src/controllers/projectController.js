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

// @desc    Create new project
// @route   POST /api/projects
// @access  Public (should be protected in production)
export const createProject = async (req, res) => {
  try {
    console.log('Request body:', req.body)
    const project = await Project.create(req.body)
    res.status(201).json(project)
  } catch (error) {
    console.log('Validation error:', error.message)
    res.status(400).json({ message: error.message })
  }
}

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Public (should be protected in production)
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
  } catch (error) {
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

    res.json({ message: 'Project removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
