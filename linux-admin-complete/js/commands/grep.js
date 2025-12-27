// js/commands/grep.js

import { getPathObject, resolvePath, canRead } from '../terminalUtils.js';
import { noSuchFileError } from '../errorMessages.js';
import { getCurrentUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

export const grepCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('grep', args);
    if (!validation.valid) {
        return validation.error;
    }

    const { nonFlags } = validation;
    let output = '';

    const pattern = nonFlags[0];
    const fileName = nonFlags[1];

    const resolved = resolvePath(fileName);
    const fileObj = getPathObject(resolved);
    const currentUser = getCurrentUser();

    if (!fileObj) {
        output = noSuchFileError(fileName);
    } else if (fileObj.type === 'directory') {
        output = `bash: grep: ${fileName}: Is a directory`;
    } else if (fileObj.type === 'file') {
        // Check read permission
        if (!canRead(fileObj, currentUser)) {
            output = `bash: grep: ${fileName}: Permission denied`;
        } else {
            // Search for pattern in file content
            const lines = fileObj.content.split('\n');
            const matchedLines = lines.filter(line => line.includes(pattern));

            if (matchedLines.length === 0) {
                output = ''; // No matches returns empty
            } else {
                output = matchedLines.join('\r\n');
            }
        }
    }

    return output;
};
