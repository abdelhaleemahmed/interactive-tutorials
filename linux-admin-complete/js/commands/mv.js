
// js/commands/mv.js

import {
    getCurrentDir,
    canRead,
    canWrite,
    resolvePath,
    getPathObject
} from '../terminalUtils.js';
import { getCurrentUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

export const mvCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('mv', args);
    if (!validation.valid) {
        return validation.error;
    }

    const { nonFlags } = validation;
    if (nonFlags.length < 2) {
        return 'mv: missing file operand';
    }

    const user = getCurrentUser();

    // Handle multiple source files (e.g., mv file1 file2 file3 dest/)
    if (nonFlags.length > 2) {
        return moveMultipleFiles(nonFlags, user);
    }

    // Single file move/rename
    const sourcePath = nonFlags[0];
    let destPath = nonFlags[1];

    // Check if destination has trailing slash (means it must be a directory)
    const destMustBeDir = destPath.endsWith('/');

    // Remove trailing slash for path resolution
    if (destMustBeDir) {
        destPath = destPath.slice(0, -1);
    }

    // Resolve source path
    const sourceResolved = resolvePath(sourcePath);
    const sourceFileName = sourceResolved[sourceResolved.length - 1];
    const sourceParentPath = sourceResolved.slice(0, -1);
    const sourceParent = sourceParentPath.length > 0 ? getPathObject(sourceParentPath) : getPathObject(['home', 'user']);

    if (!sourceParent) {
        return `mv: cannot stat '${sourcePath}': No such file or directory`;
    }

    const sourceObj = sourceParent.children[sourceFileName];
    if (!sourceObj) {
        return `mv: cannot stat '${sourcePath}': No such file or directory`;
    }

    // Check read permission on source
    if (!canRead(sourceObj, user)) {
        return `mv: cannot access '${sourcePath}': Permission denied`;
    }

    // Check write permission on source parent directory (needed to delete)
    if (!canWrite(sourceParent, user)) {
        return `mv: cannot remove '${sourcePath}': Permission denied`;
    }

    // Resolve destination path
    const destResolved = resolvePath(destPath);
    const destObj = getPathObject(destResolved);

    let destParent;
    let destFileName;

    // If destination exists and is a directory, move source inside it with same name
    if (destObj && destObj.type === 'directory') {
        destParent = destObj;
        destFileName = sourceFileName;
    } else if (destMustBeDir) {
        // Destination had trailing slash but is not a directory
        return `mv: cannot move to '${destPath}/': Not a directory`;
    } else {
        // Destination is a new filename or doesn't exist
        destFileName = destResolved[destResolved.length - 1];
        const destParentPath = destResolved.slice(0, -1);
        destParent = destParentPath.length > 0 ? getPathObject(destParentPath) : getPathObject(['home', 'user']);

        if (!destParent) {
            return `mv: cannot move to '${destPath}': No such file or directory`;
        }
    }

    if (destParent.type !== 'directory') {
        return `mv: cannot move to '${destPath}': Not a directory`;
    }

    // Check write permission on destination parent directory
    if (!canWrite(destParent, user)) {
        return `mv: cannot create '${destPath}': Permission denied`;
    }

    // Check if destination file already exists
    if (destParent.children[destFileName]) {
        const existingDest = destParent.children[destFileName];

        // Check if we can write to the existing destination
        if (!canWrite(existingDest, user)) {
            return `mv: cannot move to '${destPath}': Permission denied`;
        }

        // Check if trying to move directory over file or vice versa
        if (sourceObj.type !== existingDest.type) {
            if (sourceObj.type === 'directory') {
                return `mv: cannot overwrite non-directory '${destPath}' with directory '${sourcePath}'`;
            } else {
                return `mv: cannot overwrite directory '${destPath}' with non-directory '${sourcePath}'`;
            }
        }

        // If moving to same location, do nothing
        if (sourceParent === destParent && sourceFileName === destFileName) {
            return '';
        }

        // Overwrite existing destination
        delete destParent.children[destFileName];
    }

    // Perform the move
    destParent.children[destFileName] = {
        ...sourceObj
    };

    // Remove source
    delete sourceParent.children[sourceFileName];

    return '';
};

/**
 * Move multiple source files to a destination directory
 * @param {Array<string>} nonFlags - Array of arguments (sources..., dest)
 * @param {Object} user - Current user object
 * @returns {string} Error message or empty string on success
 */
function moveMultipleFiles(nonFlags, user) {
    // Last argument is the destination, rest are sources
    const sources = nonFlags.slice(0, -1);
    let destPath = nonFlags[nonFlags.length - 1];

    // Remove trailing slash from destination
    if (destPath.endsWith('/')) {
        destPath = destPath.slice(0, -1);
    }

    // Resolve destination - must be a directory
    const destResolved = resolvePath(destPath);
    const destObj = getPathObject(destResolved);

    if (!destObj) {
        return `mv: target '${destPath}': No such file or directory`;
    }

    if (destObj.type !== 'directory') {
        return `mv: target '${destPath}' is not a directory`;
    }

    // Check write permission on destination directory
    if (!canWrite(destObj, user)) {
        return `mv: cannot move to '${destPath}': Permission denied`;
    }

    // Move each source file into the destination directory
    let errors = [];
    for (const sourcePath of sources) {
        const sourceResolved = resolvePath(sourcePath);
        const sourceFileName = sourceResolved[sourceResolved.length - 1];
        const sourceParentPath = sourceResolved.slice(0, -1);
        const sourceParent = sourceParentPath.length > 0 ? getPathObject(sourceParentPath) : getPathObject(['home', 'user']);

        if (!sourceParent) {
            errors.push(`mv: cannot stat '${sourcePath}': No such file or directory`);
            continue;
        }

        const sourceObj = sourceParent.children[sourceFileName];
        if (!sourceObj) {
            errors.push(`mv: cannot stat '${sourcePath}': No such file or directory`);
            continue;
        }

        // Check read permission on source
        if (!canRead(sourceObj, user)) {
            errors.push(`mv: cannot access '${sourcePath}': Permission denied`);
            continue;
        }

        // Check write permission on source parent directory
        if (!canWrite(sourceParent, user)) {
            errors.push(`mv: cannot remove '${sourcePath}': Permission denied`);
            continue;
        }

        // Check if destination file already exists
        if (destObj.children[sourceFileName]) {
            const existingDest = destObj.children[sourceFileName];

            // Check if we can write to existing destination
            if (!canWrite(existingDest, user)) {
                errors.push(`mv: cannot overwrite '${destPath}/${sourceFileName}': Permission denied`);
                continue;
            }

            // Check type compatibility
            if (sourceObj.type !== existingDest.type) {
                if (sourceObj.type === 'directory') {
                    errors.push(`mv: cannot overwrite non-directory '${destPath}/${sourceFileName}' with directory '${sourcePath}'`);
                } else {
                    errors.push(`mv: cannot overwrite directory '${destPath}/${sourceFileName}' with non-directory '${sourcePath}'`);
                }
                continue;
            }

            // Overwrite existing
            delete destObj.children[sourceFileName];
        }

        // Perform the move
        destObj.children[sourceFileName] = {
            ...sourceObj
        };

        // Remove source
        delete sourceParent.children[sourceFileName];
    }

    return errors.length > 0 ? errors.join('\r\n') : '';
}
