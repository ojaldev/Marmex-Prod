/**
 * Product Specifications Utilities
 * 
 * Standardizes dimensions and weight parsing/formatting/validation
 * across the admin UI, APIs, and customer-facing pages.
 */

const DIMENSIONS_PATTERN = /^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(cm|inch|inches|in)?$/i
const WEIGHT_PATTERN = /^(\d+(?:\.\d+)?)\s*(kg|g|grams?|kilograms?)?$/i

/**
 * Parse a dimensions string into structured parts
 * @param {string} str - e.g. "18x13x5 inch", "20 × 15 × 10 cm"
 * @returns {{length:number,width:number,height:number,unit:string}|null}
 */
export function parseDimensions(str = '') {
    const trimmed = str.trim()
    if (!trimmed) return null

    const match = trimmed.match(DIMENSIONS_PATTERN)
    if (!match) return null

    const unitRaw = (match[4] || '').toLowerCase()
    let unit = 'cm'
    if (unitRaw.startsWith('in')) unit = 'inch'

    return {
        length: parseFloat(match[1]),
        width: parseFloat(match[2]),
        height: parseFloat(match[3]),
        unit
    }
}

/**
 * Format structured dimensions into a standard string
 * @param {{length:number|string,width:number|string,height:number|string,unit:string}} dims
 * @returns {string} - e.g. "18 x 13 x 5 inch"
 */
export function formatDimensions({ length, width, height, unit }) {
    const l = parseFloat(length)
    const w = parseFloat(width)
    const h = parseFloat(height)
    if ([l, w, h].some(v => isNaN(v) || v <= 0)) return ''
    const unitLabel = unit === 'inch' ? 'inch' : 'cm'
    return `${l} x ${w} x ${h} ${unitLabel}`
}

/**
 * Validate structured dimensions
 * @param {{length:number|string,width:number|string,height:number|string,unit:string}} dims
 * @returns {{valid:boolean,error?:string}}
 */
export function validateDimensions({ length, width, height, unit }) {
    const vals = [length, width, height].map(v => parseFloat(v))
    if (vals.some(v => isNaN(v))) {
        return { valid: false, error: 'Length, width, and height must be valid numbers.' }
    }
    if (vals.some(v => v <= 0)) {
        return { valid: false, error: 'Dimensions must be greater than 0.' }
    }
    if (!unit || !['cm', 'inch'].includes(unit)) {
        return { valid: false, error: 'Unit must be cm or inch.' }
    }
    // Sanity check: max 500 cm / ~200 inch
    const maxCm = unit === 'cm' ? 500 : 500 * 2.54
    if (vals.some(v => v > maxCm)) {
        return { valid: false, error: 'One or more dimensions seem unrealistically large.' }
    }
    return { valid: true }
}

/**
 * Parse a weight string into structured parts
 * @param {string} str - e.g. "1.25 kg", "500 g"
 * @returns {{value:number,unit:string}|null}
 */
export function parseWeight(str = '') {
    const trimmed = str.trim()
    if (!trimmed) return null

    const match = trimmed.match(WEIGHT_PATTERN)
    if (!match) return null

    const unitRaw = (match[2] || '').toLowerCase()
    let unit = 'kg'
    if (unitRaw === 'g' || unitRaw.startsWith('gram')) unit = 'g'

    return {
        value: parseFloat(match[1]),
        unit
    }
}

/**
 * Format structured weight into a standard string
 * @param {{value:number|string,unit:string}} w
 * @returns {string} - e.g. "1.25 kg"
 */
export function formatWeight({ value, unit }) {
    const v = parseFloat(value)
    if (isNaN(v) || v <= 0) return ''
    const unitLabel = unit === 'g' ? 'g' : 'kg'
    return `${v} ${unitLabel}`
}

/**
 * Validate structured weight
 * @param {{value:number|string,unit:string}} w
 * @returns {{valid:boolean,error?:string}}
 */
export function validateWeight({ value, unit }) {
    const v = parseFloat(value)
    if (isNaN(v)) {
        return { valid: false, error: 'Weight must be a valid number.' }
    }
    if (v <= 0) {
        return { valid: false, error: 'Weight must be greater than 0.' }
    }
    if (!unit || !['kg', 'g'].includes(unit)) {
        return { valid: false, error: 'Weight unit must be kg or g.' }
    }
    // Sanity checks
    if (unit === 'kg' && v > 1000) {
        return { valid: false, error: 'Weight seems unrealistically large (>1000 kg).' }
    }
    if (unit === 'g' && v > 1000000) {
        return { valid: false, error: 'Weight seems unrealistically large (>1000000 g).' }
    }
    return { valid: true }
}

/**
 * Normalize legacy dimension string for display
 * Adds spaces around × and ensures unit is present
 * @param {string} str
 * @returns {string}
 */
export function normalizeDimensionsDisplay(str = '') {
    if (!str) return ''
    const parsed = parseDimensions(str)
    if (!parsed) return str // can't parse, return as-is
    return formatDimensions(parsed)
}

/**
 * Normalize legacy weight string for display
 * @param {string} str
 * @returns {string}
 */
export function normalizeWeightDisplay(str = '') {
    if (!str) return ''
    const parsed = parseWeight(str)
    if (!parsed) return str
    return formatWeight(parsed)
}
