
// js/commands/rmdir.js

import { getCurrentDir } from '../terminalUtils.js';
import { noSuchFileError, directoryNotEmptyError } from '../errorMessages.js';
import { validateArgs } from '../argumentValidator.js';

export const rmdirCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('rmdir', args);
    if (!validation.valid) {
        return validation.error;
    }

    const dirToRemove = validation.nonFlags[0];
    let output = '';

    const currentDirChildren = getCurrentDir().children;
    const targetObj = currentDirChildren[dirToRemove];
    if (!targetObj) {
        output = noSuchFileError(dirToRemove);
    } else if (targetObj.type === 'file') {
        output = `bash: rmdir: ${dirToRemove}: Not a directory`;
    } else if (Object.keys(targetObj.children).length > 0) {
        output = directoryNotEmptyError(dirToRemove);
    } else {
        delete currentDirChildren[dirToRemove];
        output = '';
    }

    return output;
};
