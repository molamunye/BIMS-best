/**
 * Utility functions for image URL validation and filtering
 */

/**
 * Validates if a URL is a valid Cloudinary HTTPS URL
 * @param url - The URL to validate
 * @returns true if the URL is a valid Cloudinary HTTPS URL or blob URL
 */
export const isValidCloudinaryUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  // Only accept HTTPS Cloudinary URLs or blob URLs for preview
  return url.startsWith('https://res.cloudinary.com/') || url.startsWith('blob:');
};

/**
 * Filters an array of URLs to only include valid Cloudinary URLs
 * Removes localhost, HTTP, and other invalid URLs
 * @param urls - Array of URLs to filter
 * @returns Array of valid Cloudinary HTTPS URLs
 */
export const filterValidImageUrls = (urls: (string | null | undefined)[]): string[] => {
  return urls.filter((url): url is string => isValidCloudinaryUrl(url));
};

/**
 * Checks if a URL should be filtered out (invalid)
 * @param url - The URL to check
 * @returns true if the URL should be filtered out
 */
export const shouldFilterUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return true;
  
  // Filter out localhost URLs
  if (url.includes('localhost') || url.includes('127.0.0.1')) return true;
  
  // Filter out HTTP URLs (only allow HTTPS)
  if (url.startsWith('http://') && !url.startsWith('https://')) return true;
  
  // Filter out non-Cloudinary URLs (except blob URLs for preview)
  if (!url.startsWith('https://res.cloudinary.com/') && !url.startsWith('blob:')) {
    return true;
  }
  
  return false;
};

/**
 * Sanitizes image URLs by filtering out invalid ones
 * @param urls - Array of image URLs
 * @returns Array of sanitized, valid URLs
 */
export const sanitizeImageUrls = (urls: (string | null | undefined)[]): string[] => {
  return urls
    .filter((url): url is string => typeof url === 'string' && url.length > 0)
    .filter(url => !shouldFilterUrl(url));
};

