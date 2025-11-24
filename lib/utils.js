// Utility to convert Google Drive URLs to direct image URLs
export function convertGDriveUrl(url) {
    if (!url) return url

    // Handle /preview format
    const previewMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\/preview/)
    if (previewMatch) {
        return `https://drive.google.com/uc?export=view&id=${previewMatch[1]}`
    }

    // Handle /view?usp=drive_link format
    const viewMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\/view/)
    if (viewMatch) {
        return `https://drive.google.com/uc?export=view&id=${viewMatch[1]}`
    }

    // Already in correct format or not a Google Drive URL
    return url
}
