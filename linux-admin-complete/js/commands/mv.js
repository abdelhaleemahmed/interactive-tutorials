
// js/commands/mv.js

import { getCurrentDir } from '../terminalUtils.js';

export const mvCommand = (args) => {
    let output = '';
    if (args.length !== 2) {
        output = 'mv: missing file operand\\nTry \'mv SOURCE DEST\'';
    } else {
        const source = args[0];
        const destination = args[1];
        const currentDirChildren = getCurrentDir().children;

        const sourceObj = currentDirChildren[source];
        if (!sourceObj) {
            output = `mv: cannot stat '${source}': No such file or directory`;
        } else if (currentDirChildren[destination]) {
            output = `mv: cannot move to '${destination}': File exists`;
        } else {
            currentDirChildren[destination] = sourceObj;
            delete currentDirChildren[source];
            output = '';
        }
    }
    return output;
};
