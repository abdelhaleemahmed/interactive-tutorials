
// js/commands/pwd.js

import { currentPath } from '../terminalUtils.js';

export const pwdCommand = () => {
    return currentPath.length === 0 ? '/' : '/' + currentPath.join('/');
};
