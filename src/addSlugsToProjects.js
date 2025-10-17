import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Project from './models/Project.js'

// Load env vars
dotenv.config()

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables')
    }
    const conn = await mongoose.connect(mongoUri)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
}

const addSlugsToProjects = async () => {
  try {
    await connectDB()

    // Find all projects without a slug
    const projects = await Project.find({ $or: [{ slug: { $exists: false } }, { slug: '' }] })

    console.log(`Found ${projects.length} projects without slugs`)

    for (const project of projects) {
      const slug = generateSlug(project.title)

      // Check if slug already exists
      const existingProject = await Project.findOne({ slug, _id: { $ne: project._id } })

      if (existingProject) {
        // If slug exists, append a number
        let counter = 1
        let uniqueSlug = `${slug}-${counter}`

        while (await Project.findOne({ slug: uniqueSlug, _id: { $ne: project._id } })) {
          counter++
          uniqueSlug = `${slug}-${counter}`
        }

        project.slug = uniqueSlug
      } else {
        project.slug = slug
      }

      await project.save()
      console.log(`✅ Added slug "${project.slug}" to project: ${project.title}`)
    }

    console.log('\n✨ All projects updated successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

addSlugsToProjects()
