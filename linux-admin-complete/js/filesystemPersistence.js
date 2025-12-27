// js/filesystemPersistence.js
// Filesystem persistence using localStorage

const STORAGE_KEY = 'linux-tutorial-filesystem';
const CURRENT_PATH_KEY = 'linux-tutorial-current-path';
const VERSION_KEY = 'linux-tutorial-fs-version';
const CURRENT_VERSION = '1.0';

/**
 * Save filesystem to localStorage
 * @param {Object} fileSystem - The filesystem object to save
 */
export function saveFilesystem(fileSystem) {
    try {
        const serialized = JSON.stringify(fileSystem);
        localStorage.setItem(STORAGE_KEY, serialized);
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        return true;
    } catch (error) {
        console.warn('Failed to save filesystem:', error);
        // Check if quota exceeded
        if (error.name === 'QuotaExceededError') {
            console.warn('LocalStorage quota exceeded. Filesystem not saved.');
        }
        return false;
    }
}

/**
 * Load filesystem from localStorage
 * @param {Object} defaultFileSystem - Default filesystem to use if nothing saved
 * @returns {Object} Loaded or default filesystem
 */
export function loadFilesystem(defaultFileSystem) {
    try {
        const savedVersion = localStorage.getItem(VERSION_KEY);

        // If version mismatch, reset to default
        if (savedVersion !== CURRENT_VERSION) {
            console.log('Filesystem version mismatch. Using default filesystem.');
            return defaultFileSystem;
        }

        const serialized = localStorage.getItem(STORAGE_KEY);

        if (!serialized) {
            console.log('No saved filesystem found. Using default.');
            return defaultFileSystem;
        }

        const loaded = JSON.parse(serialized);

        // Validate basic structure
        if (!loaded || typeof loaded !== 'object' || loaded.type !== 'directory') {
            console.warn('Invalid saved filesystem. Using default.');
            return defaultFileSystem;
        }

        console.log('✓ Filesystem loaded from previous session');
        return loaded;

    } catch (error) {
        console.warn('Failed to load filesystem:', error);
        return defaultFileSystem;
    }
}

/**
 * Save current path to localStorage
 * @param {Array} currentPath - Current path array
 */
export function saveCurrentPath(currentPath) {
    try {
        localStorage.setItem(CURRENT_PATH_KEY, JSON.stringify(currentPath));
    } catch (error) {
        console.warn('Failed to save current path:', error);
    }
}

/**
 * Load current path from localStorage
 * @param {Array} defaultPath - Default path if nothing saved
 * @returns {Array} Loaded or default path
 */
export function loadCurrentPath(defaultPath) {
    try {
        const serialized = localStorage.getItem(CURRENT_PATH_KEY);
        if (!serialized) {
            return defaultPath;
        }

        const loaded = JSON.parse(serialized);
        if (!Array.isArray(loaded)) {
            return defaultPath;
        }

        return loaded;
    } catch (error) {
        console.warn('Failed to load current path:', error);
        return defaultPath;
    }
}

/**
 * Reset filesystem to default
 * @param {Object} defaultFileSystem - Default filesystem
 * @param {Array} defaultPath - Default current path
 * @returns {Object} Object with filesystem and currentPath
 */
export function resetFilesystem(defaultFileSystem, defaultPath) {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CURRENT_PATH_KEY);
        localStorage.removeItem(VERSION_KEY);
        console.log('✓ Filesystem reset to default');
        return {
            fileSystem: defaultFileSystem,
            currentPath: defaultPath
        };
    } catch (error) {
        console.warn('Failed to reset filesystem:', error);
        return {
            fileSystem: defaultFileSystem,
            currentPath: defaultPath
        };
    }
}

/**
 * Get storage statistics
 * @returns {Object} Storage info
 */
export function getStorageInfo() {
    try {
        const fsData = localStorage.getItem(STORAGE_KEY);
        const pathData = localStorage.getItem(CURRENT_PATH_KEY);

        const fsSize = fsData ? new Blob([fsData]).size : 0;
        const pathSize = pathData ? new Blob([pathData]).size : 0;
        const totalSize = fsSize + pathSize;

        return {
            filesystemSize: fsSize,
            pathSize: pathSize,
            totalSize: totalSize,
            filesystemSizeKB: (fsSize / 1024).toFixed(2),
            totalSizeKB: (totalSize / 1024).toFixed(2),
            hasSavedData: !!fsData
        };
    } catch (error) {
        return {
            filesystemSize: 0,
            pathSize: 0,
            totalSize: 0,
            filesystemSizeKB: '0.00',
            totalSizeKB: '0.00',
            hasSavedData: false
        };
    }
}

/**
 * Check if persistence is available
 * @returns {boolean} True if localStorage is available
 */
export function isPersistenceAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Auto-save wrapper for filesystem mutations
 * Creates a debounced save function to avoid excessive writes
 * @param {Function} saveFunction - The save function to debounce
 * @param {number} delay - Delay in milliseconds (default 500ms)
 * @returns {Function} Debounced save function
 */
export function createAutoSave(saveFunction, delay = 500) {
    let timeoutId = null;

    return function(...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            saveFunction(...args);
            timeoutId = null;
        }, delay);
    };
}

/**
 * Export filesystem as JSON file (for backup)
 * @param {Object} fileSystem - Filesystem to export
 * @param {string} filename - Output filename
 */
export function exportFilesystem(fileSystem, filename = 'linux-tutorial-backup.json') {
    try {
        const data = JSON.stringify(fileSystem, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Failed to export filesystem:', error);
        return false;
    }
}

/**
 * Import filesystem from JSON file
 * @param {File} file - File object to import
 * @returns {Promise<Object>} Promise resolving to imported filesystem
 */
export function importFilesystem(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);

                // Validate structure
                if (!imported || typeof imported !== 'object' || imported.type !== 'directory') {
                    reject(new Error('Invalid filesystem format'));
                    return;
                }

                resolve(imported);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
