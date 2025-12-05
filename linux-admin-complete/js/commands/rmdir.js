
// js/commands/rmdir.js

import { getCurrentDir } from '../terminalUtils.js';
import { noSuchFileError, missingArgumentError, directoryNotEmptyError } from '../errorMessages.js';

export const rmdirCommand = (args) => {
    const dirToRemove = args[0];
    let output = '';
    if (!dirToRemove) {
        output = missingArgumentError('rmdir', 'operand');
    } else {
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
    }
    return output;
};
