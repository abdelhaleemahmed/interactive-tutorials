// js/commands/tail.js

import { getPathObject, resolvePath, canRead } from '../terminalUtils.js';
import { noSuchFileError, missingArgumentError } from '../errorMessages.js';
import { getCurrentUser } from '../userManagement.js';

export const tailCommand = (args) => {
    let output = '';
    const currentUser = getCurrentUser();

    if (args.length === 0) {
        output = missingArgumentError('tail', 'operand');
    } else {
        let fileName = args[0];
        let lines = 10; // Default number of lines

        // Handle -n option: tail -n 5 file.txt
        if (args[0] === '-n' && args[1]) {
            lines = parseInt(args[1], 10);
            fileName = args[2];
        }

        if (!fileName) {
            output = missingArgumentError('tail', 'file');
        } else {
            const resolved = resolvePath(fileName);
            const fileObj = getPathObject(resolved);

            if (!fileObj) {
                output = noSuchFileError(fileName);
            } else if (fileObj.type === 'directory') {
                output = `bash: tail: ${fileName}: Is a directory`;
            } else if (fileObj.type === 'file') {
                // Check read permission
                if (!canRead(fileObj, currentUser)) {
                    output = `bash: tail: ${fileName}: Permission denied`;
                } else {
                    const fileLines = fileObj.content.split('\n');
                    const tailLines = fileLines.slice(-lines);
                    output = tailLines.join('\r\n');
                }
            }
        }
    }

    return output;
};
