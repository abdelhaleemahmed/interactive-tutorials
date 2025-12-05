
// js/commands/rm.js

import { getCurrentDir } from '../terminalUtils.js';
import { noSuchFileError, missingArgumentError, isADirectoryError } from '../errorMessages.js';

export const rmCommand = (args) => {
    const fileToRemove = args[0];
    let output = '';
    if (!fileToRemove) {
        output = missingArgumentError('rm', 'operand');
    } else {
        const currentDirChildren = getCurrentDir().children;
        const targetObj = currentDirChildren[fileToRemove];
        if (!targetObj) {
            output = noSuchFileError(fileToRemove);
        } else if (targetObj.type === 'directory') {
            output = isADirectoryError(fileToRemove);
        } else {
            delete currentDirChildren[fileToRemove];
            output = '';
        }
    }
    return output;
};
