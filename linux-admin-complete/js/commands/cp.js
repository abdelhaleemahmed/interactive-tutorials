
// js/commands/cp.js

import {
    getCurrentDir,
    getCurrentDateFormatted,
    canRead,
    canWrite,
    resolvePath,
    getPathObject,
    currentPath
} from '../terminalUtils.js';
import { getCurrentUser } from '../userManagement.js';
import { validateArgs, hasFlag } from '../argumentValidator.js';

/**
 * Get the parent directory object for a given path
 * @param {string} path - The path to get parent for
 * @returns {Object|null} The parent directory object or null
 */
function getParentDir(path) {
    const pathArray = path.split('/').filter(s => s !== '');
    if (pathArray.length === 0) {
        return null; // Root has no parent
    }

    // Get parent path
    pathArray.pop();

    // If parent is current dir
    if (pathArray.length === 0 || pathArray.join('/') === currentPath.join('/')) {
        return getCurrentDir();
    }

    // Resolve and get parent
    const parentPathResolved = resolvePath(pathArray.join('/'));
    return getPathObject(parentPathResolved);
}

/**
 * Recursively copy a directory and its contents
 * @param {Object} sourceObj - Source directory object
 * @param {string} sourceName - Name of source
 * @param {Object} destParent - Destination parent directory
 * @param {string} destName - Name for destination
 * @param {Object} user - Current user object
 * @returns {Object|null} Error object or null if successful
 */
function recursiveCopy(sourceObj, sourceName, destParent, destName, user) {
    // Check read permission on source directory
    if (!canRead(sourceObj, user)) {
        return { error: `cp: cannot open directory '${sourceName}': Permission denied` };
    }

    // Create destination directory with same permissions
    destParent.children[destName] = {
        type: 'directory',
        owner: user.username,
        group: user.username,
        permissions: sourceObj.permissions,
        created: Date.now(),
        modified: Date.now(),
        children: {}
    };

    // Copy all children
    for (const [childName, childObj] of Object.entries(sourceObj.children || {})) {
        if (!canRead(childObj, user)) {
            // Skip files we can't read, but continue
            continue;
        }

        if (childObj.type === 'directory') {
            const result = recursiveCopy(
                childObj,
                `${sourceName}/${childName}`,
                destParent.children[destName],
                childName,
                user
            );
            if (result && result.error) {
                return result;
            }
        } else {
            // Copy file
            destParent.children[destName].children[childName] = {
                ...childObj,
                owner: user.username,
                group: user.username,
                modified: Date.now(),
                date: getCurrentDateFormatted()
            };
        }
    }

    return null;
}

export const cpCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('cp', args);
    if (!validation.valid) {
        return validation.error;
    }

    const { flags, nonFlags } = validation;
    const user = getCurrentUser();
    let output = '';
    const recursive = hasFlag(flags, 'r') || hasFlag(flags, 'R');

    let source = nonFlags[0];
    let destination = nonFlags[1];

    // Remove trailing slashes
    if (source.endsWith('/') && source.length > 1) {
        source = source.slice(0, -1);
    }
    if (destination.endsWith('/') && destination.length > 1) {
        destination = destination.slice(0, -1);
    }

    const currentDir = getCurrentDir();
    const currentDirChildren = currentDir.children;

    // Get source object
    const sourceObj = currentDirChildren[source];
    if (!sourceObj) {
        return `cp: cannot stat '${source}': No such file or directory`;
    }

    // Check read permission on source
    if (!canRead(sourceObj, user)) {
        return `cp: cannot open '${source}' for reading: Permission denied`;
    }

    // Handle directory copying
    if (sourceObj.type === 'directory') {
        if (!recursive) {
            return `cp: -r not specified; omitting directory '${source}'`;
        }

        // Check if destination exists
        if (currentDirChildren[destination]) {
            return `cp: cannot copy directory to '${destination}': File exists`;
        }

        // Check write permission on current directory
        if (!canWrite(currentDir, user)) {
            return `cp: cannot create directory '${destination}': Permission denied`;
        }

        // Perform recursive copy
        const result = recursiveCopy(sourceObj, source, currentDir, destination, user);
        if (result && result.error) {
            return result.error;
        }

        return '';
    }

    // Handle file copying

    // Check if destination exists (prompt for overwrite in real system)
    if (currentDirChildren[destination]) {
        // For now, we'll allow overwrite if user has write permission
        if (!canWrite(currentDirChildren[destination], user)) {
            return `cp: cannot create regular file '${destination}': Permission denied`;
        }
    }

    // Check write permission on current directory (for creating new file)
    if (!currentDirChildren[destination] && !canWrite(currentDir, user)) {
        return `cp: cannot create regular file '${destination}': Permission denied`;
    }

    // Perform the copy
    currentDirChildren[destination] = {
        ...sourceObj,
        owner: user.username,
        group: user.username,
        modified: Date.now(),
        date: getCurrentDateFormatted()
    };

    return '';
};
