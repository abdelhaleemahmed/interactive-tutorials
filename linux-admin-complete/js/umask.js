// js/umask.js
// File creation mask (umask) system

/**
 * Current umask value
 * Default: 0o022 (files: 644, directories: 755)
 */
let currentUmask = 0o022;

/**
 * Get the current umask value
 * @returns {number} Current umask value (octal)
 */
export function getUmask() {
    return currentUmask;
}

/**
 * Set a new umask value
 * @param {number} newUmask - New umask value (octal)
 * @returns {boolean} True if successful, false if invalid
 */
export function setUmask(newUmask) {
    if (typeof newUmask !== 'number' || newUmask < 0 || newUmask > 0o777) {
        return false;
    }
    currentUmask = newUmask;
    return true;
}

/**
 * Apply umask to default permissions
 * @param {number} defaultPerms - Default permissions (e.g., 0o666 for files, 0o777 for dirs)
 * @returns {number} Actual permissions after applying umask
 */
export function applyUmask(defaultPerms) {
    return defaultPerms & ~currentUmask;
}

/**
 * Calculate file permissions with current umask
 * Default file permissions: 0o666
 * @returns {number} Actual file permissions
 */
export function getFilePermissions() {
    return applyUmask(0o666);
}

/**
 * Calculate directory permissions with current umask
 * Default directory permissions: 0o777
 * @returns {number} Actual directory permissions
 */
export function getDirectoryPermissions() {
    return applyUmask(0o777);
}

/**
 * Reset umask to default value
 */
export function resetUmask() {
    currentUmask = 0o022;
}

/**
 * Format umask as 4-digit octal string
 * @param {number} umask - Umask value
 * @returns {string} Formatted umask (e.g., "0022")
 */
export function formatUmask(umask) {
    return umask.toString(8).padStart(4, '0');
}
