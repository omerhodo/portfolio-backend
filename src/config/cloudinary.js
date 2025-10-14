import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

// Lazy configuration - configure only when needed
let isConfigured = false

const configureCloudinary = () => {
  if (!isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    })
    isConfigured = true
  }
}

export const uploadBuffer = (buffer, folder = 'portfolio') => {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error)
      resolve(result)
    })
    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}

// Delete by public_id
export const deleteByPublicId = async (publicId) => {
  if (!publicId) return null
  configureCloudinary()
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (err) {
    // don't throw to avoid failing main flow; caller can log
    return null
  }
}

export default cloudinary
