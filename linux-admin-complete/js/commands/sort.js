// js/commands/sort.js

import { getPathObject, resolvePath, canRead } from '../terminalUtils.js';
import { noSuchFileError, missingArgumentError } from '../errorMessages.js';
import { getCurrentUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

export const sortCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('sort', args);
    if (!validation.valid) {
        return validation.error;
    }

    let output = '';
    const currentUser = getCurrentUser();

    if (args.length === 0) {
        output = missingArgumentError('sort', 'operand');
    } else {
        let fileName = args[0];
        let reverse = false;
        let numeric = false;

        // Handle -r (reverse) and -n (numeric) options
        args.forEach(arg => {
            if (arg === '-r') reverse = true;
            if (arg === '-n') numeric = true;
            if (!arg.startsWith('-')) fileName = arg;
        });

        if (!fileName) {
            output = missingArgumentError('sort', 'file');
        } else {
            const resolved = resolvePath(fileName);
            const fileObj = getPathObject(resolved);

            if (!fileObj) {
                output = noSuchFileError(fileName);
            } else if (fileObj.type === 'directory') {
                output = `bash: sort: ${fileName}: Is a directory`;
            } else if (fileObj.type === 'file') {
                // Check read permission
                if (!canRead(fileObj, currentUser)) {
                    output = `bash: sort: ${fileName}: Permission denied`;
                } else {
                    const fileLines = fileObj.content.split('\n').filter(line => line.trim());

                    let sortedLines = [...fileLines];

                    if (numeric) {
                        // Numeric sort
                        sortedLines.sort((a, b) => {
                            const numA = parseFloat(a.trim());
                            const numB = parseFloat(b.trim());
                            return reverse ? numB - numA : numA - numB;
                        });
                    } else {
                        // Alphabetical sort
                        sortedLines.sort((a, b) => {
                            if (reverse) {
                                return b.localeCompare(a);
                            }
                            return a.localeCompare(b);
                        });
                    }

                    output = sortedLines.join('\r\n');
                }
            }
        }
    }

    return output;
};
