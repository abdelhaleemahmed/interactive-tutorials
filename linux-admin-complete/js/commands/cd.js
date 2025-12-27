
// js/commands/cd.js

import {
    currentPath, updateCurrentPath, getCurrentDir,
    getPathObject, resolvePath, canExecute
} from '../terminalUtils.js';
import { noSuchFileError, notADirectoryError } from '../errorMessages.js';
import { getCurrentUser } from '../userManagement.js';
import { expandVariables } from '../variableExpansion.js';
import { getEnvironmentVariable, updatePWD } from '../environmentVariables.js';
import { validateArgs } from '../argumentValidator.js';

export const cdCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('cd', args);
    if (!validation.valid) {
        return validation.error;
    }

    let targetCd = validation.nonFlags[0];
    let output = '';
    const currentUser = getCurrentUser();

    // cd with no arguments goes to $HOME
    if (!targetCd) {
        targetCd = getEnvironmentVariable('HOME');
    }

    // Expand variables in the target path
    targetCd = expandVariables(targetCd);

    if (targetCd === '~') {
        updateCurrentPath(['home', 'user']);
        updatePWD(getCurrentDir());
    } else if (targetCd === '..') {
        if (currentPath.length > 0) {
            updateCurrentPath(currentPath.slice(0, -1));
            updatePWD(getCurrentDir());
        }
    } else if (targetCd === '/') {
        updateCurrentPath([]);
        updatePWD('/');
    } else {
        const resolved = resolvePath(targetCd);
        const targetObj = getPathObject(resolved);

        if (targetObj && targetObj.type === 'directory') {
            // Check execute permission on directory
            if (!canExecute(targetObj, currentUser)) {
                output = `bash: cd: ${args[0]}: Permission denied`;
            } else {
                updateCurrentPath(resolved);
                updatePWD(getCurrentDir());
            }
        } else if (targetObj && targetObj.type === 'file') {
            output = notADirectoryError(args[0]);
        } else {
            output = noSuchFileError(args[0]);
        }
    }
    return output;
};
