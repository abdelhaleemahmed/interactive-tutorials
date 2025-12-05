
// js/commands/cat.js

import { getPathObject, resolvePath, canRead } from '../terminalUtils.js';
import { noSuchFileError, missingArgumentError } from '../errorMessages.js';
import { getCurrentUser } from '../userManagement.js';

export const catCommand = (args) => {
    const fileName = args[0];
    let output = '';
    if (!fileName) {
        output = missingArgumentError('cat', 'operand');
    } else {
        const resolved = resolvePath(fileName);
        const fileObj = getPathObject(resolved);
        const currentUser = getCurrentUser();

        if (!fileObj) {
            output = noSuchFileError(fileName);
        } else if (fileObj.type === 'directory') {
            output = `bash: cat: ${fileName}: Is a directory`;
        } else if (fileObj.type === 'file') {
            // Check read permission
            if (!canRead(fileObj, currentUser)) {
                output = `bash: cat: ${fileName}: Permission denied`;
            } else {
                output = fileObj.content;
            }
        }
    }
    return output;
};
