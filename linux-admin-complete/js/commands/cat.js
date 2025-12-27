
// js/commands/cat.js

import { getPathObject, resolvePath, canRead } from '../terminalUtils.js';
import { noSuchFileError } from '../errorMessages.js';
import { getCurrentUser } from '../userManagement.js';
import { expandVariables } from '../variableExpansion.js';
import { validateArgs } from '../argumentValidator.js';

export const catCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('cat', args);
    if (!validation.valid) {
        return validation.error;
    }

    let fileName = validation.nonFlags[0];
    let output = '';

    if (fileName) {
        // Expand variables in file path
        fileName = expandVariables(fileName);

        const resolved = resolvePath(fileName);
        const fileObj = getPathObject(resolved);
        const currentUser = getCurrentUser();

        if (!fileObj) {
            output = noSuchFileError(args[0]);
        } else if (fileObj.type === 'directory') {
            output = `bash: cat: ${args[0]}: Is a directory`;
        } else if (fileObj.type === 'file') {
            // Check read permission
            if (!canRead(fileObj, currentUser)) {
                output = `bash: cat: ${args[0]}: Permission denied`;
            } else {
                output = fileObj.content;
            }
        }
    }
    return output;
};
