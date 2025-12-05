
// js/commands/touch.js

import { getCurrentDir, getCurrentDateFormatted, defaultFilePermissions } from '../terminalUtils.js';

export const touchCommand = (args) => {
    const fileToTouch = args[0];
    let output = '';
    if (!fileToTouch) {
        output = 'touch: missing file operand';
    } else {
        const currentDirChildren = getCurrentDir().children;
        if (currentDirChildren[fileToTouch] && currentDirChildren[fileToTouch].type === 'file') {
            currentDirChildren[fileToTouch].date = getCurrentDateFormatted();
            output = '';
        } else if (currentDirChildren[fileToTouch] && currentDirChildren[fileToTouch].type === 'directory') {
            output = `touch: cannot touch '${fileToTouch}': Is a directory`;
        } else {
            currentDirChildren[fileToTouch] = {
                type: 'file',
                content: '',
                size: 0,
                date: getCurrentDateFormatted(),
                permissions: defaultFilePermissions
            };
            output = '';
        }
    }
    return output;
};
