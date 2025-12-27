
// js/commands/rm.js

import { getCurrentDir, canWrite } from '../terminalUtils.js';
import { getCurrentUser } from '../userManagement.js';
import { noSuchFileError, isADirectoryError } from '../errorMessages.js';
import { validateArgs, hasFlag } from '../argumentValidator.js';

/**
 * Recursively delete a directory and all its contents
 * @param {Object} dirObj - Directory object to delete
 * @param {string} dirName - Name of directory
 * @param {Object} user - Current user object
 * @returns {string|null} Error message or null if successful
 */
function recursiveDelete(dirObj, dirName, user) {
    // Note: In real rm -r, permission checking is complex
    // We'll check if we can write to the directory before deleting its contents
    if (!canWrite(dirObj, user)) {
        return `rm: cannot remove '${dirName}': Permission denied`;
    }

    // Delete all children first
    for (const [childName, childObj] of Object.entries(dirObj.children || {})) {
        if (childObj.type === 'directory') {
            const error = recursiveDelete(childObj, `${dirName}/${childName}`, user);
            if (error) {
                return error;
            }
        }
        // For files, we just delete them (parent dir is writable)
    }

    return null;
}

export const rmCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('rm', args);
    if (!validation.valid) {
        return validation.error;
    }

    const { flags, nonFlags } = validation;
    const user = getCurrentUser();
    const recursive = hasFlag(flags, 'r') || hasFlag(flags, 'R');
    const force = hasFlag(flags, 'f');

    const currentDir = getCurrentDir();
    const currentDirChildren = currentDir.children;

    // Handle multiple files (from wildcard expansion or explicit list)
    let errors = [];
    for (let fileToRemove of nonFlags) {
        // Remove trailing slash if present
        if (fileToRemove.endsWith('/') && fileToRemove.length > 1) {
            fileToRemove = fileToRemove.slice(0, -1);
        }

        const targetObj = currentDirChildren[fileToRemove];

        if (!targetObj) {
            if (!force) {
                errors.push(noSuchFileError(fileToRemove));
            }
            continue;
        }

        // Key permission check: Need write permission on PARENT directory
        // (not on the file itself - you can delete a read-only file if you own the directory)
        // This is the parent_check - checking parent directory write permission
        if (!canWrite(currentDir, user)) {
            errors.push(`rm: cannot remove '${fileToRemove}': Permission denied`);
            continue;
        }

        // Handle directory deletion
        if (targetObj.type === 'directory') {
            if (!recursive) {
                errors.push(`rm: cannot remove '${fileToRemove}': Is a directory`);
                continue;
            }

            // Recursively delete directory contents
            const error = recursiveDelete(targetObj, fileToRemove, user);
            if (error) {
                errors.push(error);
                continue;
            }
        }

        // Perform the deletion
        delete currentDirChildren[fileToRemove];
    }

    return errors.length > 0 ? errors.join('\r\n') : '';
};
