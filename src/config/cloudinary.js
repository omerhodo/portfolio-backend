import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

// Configure Cloudinary using env vars CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

// Upload buffer to Cloudinary and return result
export const uploadBuffer = (buffer, folder = 'portfolio') => {
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
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (err) {
    // don't throw to avoid failing main flow; caller can log
    return null
  }
}

export default cloudinary
