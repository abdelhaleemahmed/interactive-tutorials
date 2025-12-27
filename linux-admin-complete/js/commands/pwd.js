
// js/commands/pwd.js

import { currentPath } from '../terminalUtils.js';
import { validateArgs } from '../argumentValidator.js';

export const pwdCommand = (args = []) => {
    // Validate arguments
    const validation = validateArgs('pwd', args);
    if (!validation.valid) {
        return validation.error;
    }

    return currentPath.length === 0 ? '/' : '/' + currentPath.join('/');
};
