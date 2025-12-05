
// js/commands/mkdir.js

import {
    getCurrentDir, getCurrentDateFormatted,
    defaultDirPermissions, defaultOwner, defaultGroup
} from '../terminalUtils.js';

export const mkdirCommand = (args) => {
    const newDirName = args[0];
    let output = '';
    if (!newDirName) {
        output = 'mkdir: missing operand';
    } else {
        const currentDirChildren = getCurrentDir().children;
        if (currentDirChildren[newDirName]) {
            output = `mkdir: cannot create directory '${newDirName}': File exists`;
        } else {
            currentDirChildren[newDirName] = {
                type: 'directory',
                children: {},
                permissions: defaultDirPermissions,
                date: getCurrentDateFormatted(),
                size: 4096
            };
            output = '';
        }
    }
    return output;
};
