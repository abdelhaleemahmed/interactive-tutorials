
// js/commands/cd.js

import {
    currentPath, updateCurrentPath,
    getPathObject, resolvePath, canExecute
} from '../terminalUtils.js';
import { noSuchFileError, notADirectoryError } from '../errorMessages.js';
import { getCurrentUser } from '../userManagement.js';

export const cdCommand = (args) => {
    const targetCd = args[0];
    let output = '';
    const currentUser = getCurrentUser();

    if (!targetCd || targetCd === '~') {
        updateCurrentPath(['home', 'user']);
    } else if (targetCd === '..') {
        if (currentPath.length > 0) {
            updateCurrentPath(currentPath.slice(0, -1));
        }
    } else if (targetCd === '/') {
        updateCurrentPath([]);
    } else {
        const resolved = resolvePath(targetCd);
        const targetObj = getPathObject(resolved);

        if (targetObj && targetObj.type === 'directory') {
            // Check execute permission on directory
            if (!canExecute(targetObj, currentUser)) {
                output = `bash: cd: ${targetCd}: Permission denied`;
            } else {
                updateCurrentPath(resolved);
            }
        } else if (targetObj && targetObj.type === 'file') {
            output = notADirectoryError(targetCd);
        } else {
            output = noSuchFileError(targetCd);
        }
    }
    return output;
};
