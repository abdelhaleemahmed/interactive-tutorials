
// js/commands/cp.js

import { getCurrentDir, getCurrentDateFormatted } from '../terminalUtils.js';

export const cpCommand = (args) => {
    let output = '';
    if (args.length !== 2) {
        output = 'cp: missing file operand\\nTry \'cp SOURCE DEST\'';
    } else {
        const source = args[0];
        const destination = args[1];
        const currentDirChildren = getCurrentDir().children;

        const sourceObj = currentDirChildren[source];
        if (!sourceObj) {
            output = `cp: cannot stat '${source}': No such file or directory`;
        } else if (sourceObj.type === 'directory') {
            output = `cp: -r not specified; omitting directory '${source}'`;
        } else if (currentDirChildren[destination]) {
            output = `cp: cannot copy to '${destination}': File exists`;
        } else {
            currentDirChildren[destination] = { ...sourceObj, date: getCurrentDateFormatted() };
            output = '';
        }
    }
    return output;
};
