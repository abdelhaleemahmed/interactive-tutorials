
// js/commands/mkdir.js

import {
    getCurrentDir,
    getCurrentDateFormatted,
    canWrite,
    resolvePath,
    getPathObject,
    fileSystem
} from '../terminalUtils.js';
import { getCurrentUser } from '../userManagement.js';
import { getDirectoryPermissions } from '../umask.js';
import { validateArgs, hasFlag } from '../argumentValidator.js';

export const mkdirCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('mkdir', args);
    if (!validation.valid) {
        return validation.error;
    }

    const { flags, nonFlags } = validation;
    const user = getCurrentUser();
    const createParents = hasFlag(flags, 'p');
    const newDirName = nonFlags[0];

    // Handle -p flag for creating parent directories
    if (createParents && newDirName.includes('/')) {
        // Split path and create each directory in sequence
        const pathParts = newDirName.split('/').filter(s => s !== '');
        let currentObj = newDirName.startsWith('/') ? fileSystem : getCurrentDir();
        let currentPathStr = newDirName.startsWith('/') ? '/' : '';

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            const fullPath = currentPathStr + part;

            // Check if this part exists
            if (!currentObj.children[part]) {
                // Check write permission on current directory
                if (!canWrite(currentObj, user)) {
                    return `mkdir: cannot create directory '${fullPath}': Permission denied`;
                }

                // Create the directory with umask applied
                const dirPerms = getDirectoryPermissions();

                currentObj.children[part] = {
                    type: 'directory',
                    owner: user.username,
                    group: user.username,
                    permissions: dirPerms,
                    created: Date.now(),
                    modified: Date.now(),
                    children: {},
                    size: 4096
                };
            } else if (currentObj.children[part].type !== 'directory') {
                return `mkdir: cannot create directory '${fullPath}': File exists`;
            }

            // Move into this directory for next iteration
            currentObj = currentObj.children[part];
            currentPathStr += part + '/';
        }

        return '';
    }

    // Standard mkdir (no -p flag or simple name)
    // Handle absolute paths and paths with parent directories
    if (newDirName.includes('/')) {
        // For paths like /var/projects/team-app or subdir/newdir
        const resolved = resolvePath(newDirName);

        // Check if it already exists
        const existing = getPathObject(resolved);
        if (existing) {
            return `mkdir: cannot create directory '${newDirName}': File exists`;
        }

        // Get parent directory
        const pathParts = [...resolved];
        const dirNameOnly = pathParts.pop();
        const parentDir = getPathObject(pathParts);

        if (!parentDir) {
            return `mkdir: cannot create directory '${newDirName}': No such file or directory`;
        }

        if (parentDir.type !== 'directory') {
            return `mkdir: cannot create directory '${newDirName}': Not a directory`;
        }

        // Check write permission on parent directory
        if (!canWrite(parentDir, user)) {
            return `mkdir: cannot create directory '${newDirName}': Permission denied`;
        }

        // Create the directory with umask applied
        const dirPerms = getDirectoryPermissions();

        parentDir.children[dirNameOnly] = {
            type: 'directory',
            owner: user.username,
            group: user.username,
            permissions: dirPerms,
            created: Date.now(),
            modified: Date.now(),
            children: {},
            date: getCurrentDateFormatted(),
            size: 4096
        };

        return '';
    }

    // Simple directory name in current directory
    const currentDir = getCurrentDir();
    const currentDirChildren = currentDir.children;

    // Check if already exists
    if (currentDirChildren[newDirName]) {
        return `mkdir: cannot create directory '${newDirName}': File exists`;
    }

    // Check write permission on current directory
    if (!canWrite(currentDir, user)) {
        return `mkdir: cannot create directory '${newDirName}': Permission denied`;
    }

    // Create the directory with umask applied
    const dirPerms = getDirectoryPermissions();

    currentDirChildren[newDirName] = {
        type: 'directory',
        owner: user.username,
        group: user.username,
        permissions: dirPerms,
        created: Date.now(),
        modified: Date.now(),
        children: {},
        date: getCurrentDateFormatted(),
        size: 4096
    };

    return '';
};
