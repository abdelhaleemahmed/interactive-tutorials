
// js/commands/touch.js

import { getPathObject, resolvePath, getCurrentDateFormatted } from '../terminalUtils.js';
import { getCurrentUser } from '../userManagement.js';
import { getFilePermissions } from '../umask.js';
import { validateArgs } from '../argumentValidator.js';

export const touchCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('touch', args);
    if (!validation.valid) {
        return validation.error;
    }

    const filesToTouch = validation.nonFlags;
    let output = '';
    const currentUser = getCurrentUser();

    // Process each file
    for (const fileToTouch of filesToTouch) {
        // Resolve the path
        const resolved = resolvePath(fileToTouch);
        const fileName = resolved[resolved.length - 1];
        const dirPath = resolved.slice(0, -1);

        // Get the parent directory
        const parentDir = dirPath.length > 0 ? getPathObject(dirPath) : getPathObject(['home', 'user']);

        if (!parentDir) {
            if (output) output += '\r\n';
            output += `touch: cannot touch '${fileToTouch}': No such file or directory`;
            continue;
        }

        if (parentDir.type !== 'directory') {
            if (output) output += '\r\n';
            output += `touch: cannot touch '${fileToTouch}': Not a directory`;
            continue;
        }

        // Check if file exists
        if (parentDir.children[fileName]) {
            if (parentDir.children[fileName].type === 'file') {
                // File exists, update timestamp
                parentDir.children[fileName].date = getCurrentDateFormatted();
            } else {
                // It's a directory
                if (output) output += '\r\n';
                output += `touch: cannot touch '${fileToTouch}': Is a directory`;
            }
        } else {
            // File doesn't exist, create it
            const filePerms = getFilePermissions();

            parentDir.children[fileName] = {
                type: 'file',
                content: '',
                size: 0,
                date: getCurrentDateFormatted(),
                permissions: filePerms,
                owner: currentUser.username,
                group: currentUser.username
            };
        }
    }

    return output;
};
