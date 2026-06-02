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
 * @param {Object|string} options - Cloudinary folder name or options object
 * @returns {Promise<Object>} Upload result with URL
 */
export async function uploadImage(file, options = 'marmex') {
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

        // Handle both string (folder name) and object (options) parameter
        let folder = 'marmex'
        let transformation = [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto:good' }
        ]

        if (typeof options === 'string') {
            folder = options
        } else if (typeof options === 'object' && options !== null) {
            folder = options.folder || 'marmex'
            transformation = options.transformation || transformation
        }

        console.log('🔄 Cloudinary: Uploading image to folder:', folder)
        console.log('📊 Cloudinary: Using cloud name:', process.env.CLOUDINARY_CLOUD_NAME)

        const result = await cloudinary.uploader.upload(file, {
            folder: folder,
            resource_type: options.resource_type || 'auto',
            transformation: options.resource_type === 'video' ? undefined : transformation
        })

        console.log('✅ Cloudinary: Image uploaded successfully')
        console.log('📷 Cloudinary: URL:', result.secure_url)

        return {
            url: result.secure_url,
            secure_url: result.secure_url,
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
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID
 */
export function extractPublicIdFromUrl(url) {
    if (!url || typeof url !== 'string') return null;
    try {
        const splitUrl = url.split('/upload/');
        if (splitUrl.length < 2) return null;
        
        const pathAfterUpload = splitUrl[1];
        const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
        const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, '');
        
        return publicId;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
export async function deleteImage(publicId) {
    try {
        console.log(`🗑️ Cloudinary: Deleting image with public ID: ${publicId}`);
        await cloudinary.uploader.destroy(publicId);
        console.log(`✅ Cloudinary: Image deleted successfully`);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
    }
}

/**
 * Delete video from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
export async function deleteVideo(publicId) {
    try {
        console.log(`🗑️ Cloudinary: Deleting video with public ID: ${publicId}`);
        await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        console.log(`✅ Cloudinary: Video deleted successfully`);
    } catch (error) {
        console.error('Cloudinary video delete error:', error);
    }
}

/**
 * Delete image from Cloudinary using URL
 * @param {string} url - Cloudinary URL
 */
/**
 * Delete resource from Cloudinary using URL (auto-detects image vs video)
 * @param {string} url - Cloudinary URL
 * @param {string} resourceType - 'image' or 'video'
 */
export async function deleteResourceFromUrl(url, resourceType = 'image') {
    const publicId = extractPublicIdFromUrl(url);
    if (publicId) {
        if (resourceType === 'video') {
            return deleteVideo(publicId);
        }
        return deleteImage(publicId);
    }
}

export { cloudinary }

// Backward-compatible alias
export { deleteResourceFromUrl as deleteImageFromUrl }
