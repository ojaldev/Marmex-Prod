import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * Upload image to Cloudinary
 * @param {string} file - Base64 encoded image or file path
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Object>} Upload result with URL
 */
export async function uploadImage(file, folder = 'marmex') {
    try {
        // Check if credentials are configured
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            console.error('❌ Cloudinary Error: CLOUDINARY_CLOUD_NAME not configured')
            throw new Error('Cloudinary cloud name not configured')
        }
        if (!process.env.CLOUDINARY_API_KEY) {
            console.error('❌ Cloudinary Error: CLOUDINARY_API_KEY not configured')
            throw new Error('Cloudinary API key not configured')
        }
        if (!process.env.CLOUDINARY_API_SECRET) {
            console.error('❌ Cloudinary Error: CLOUDINARY_API_SECRET not configured')
            throw new Error('Cloudinary API secret not configured')
        }

        console.log('🔄 Cloudinary: Uploading image to folder:', folder)
        console.log('📊 Cloudinary: Using cloud name:', process.env.CLOUDINARY_CLOUD_NAME)

        const result = await cloudinary.uploader.upload(file, {
            folder: folder,
            resource_type: 'auto',
            transformation: [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto:good' }
            ]
        })

        console.log('✅ Cloudinary: Image uploaded successfully')
        console.log('📷 Cloudinary: URL:', result.secure_url)

        return {
            url: result.secure_url,
            publicId: result.public_id
        }
    } catch (error) {
        console.error('❌ Cloudinary upload error:', {
            message: error.message,
            statusCode: error.http_code,
            error: error
        })
        throw new Error(`Failed to upload image: ${error.message}`)
    }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
export async function deleteImage(publicId) {
    try {
        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.error('Cloudinary delete error:', error)
    }
}

export { cloudinary }
