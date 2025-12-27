// js/commands/uniq.js

import { getPathObject, resolvePath, canRead } from '../terminalUtils.js';
import { noSuchFileError, missingArgumentError } from '../errorMessages.js';
import { getCurrentUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

export const uniqCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('uniq', args);
    if (!validation.valid) {
        return validation.error;
    }

    let output = '';
    const currentUser = getCurrentUser();

    if (args.length === 0) {
        output = missingArgumentError('uniq', 'operand');
    } else {
        let fileName = args[0];
        let countMode = false;
        let duplicateOnly = false;
        let uniqueOnly = false;

        // Handle options
        args.forEach(arg => {
            if (arg === '-c') countMode = true;       // Count occurrences
            if (arg === '-d') duplicateOnly = true;   // Only show duplicates
            if (arg === '-u') uniqueOnly = true;      // Only show unique lines
            if (!arg.startsWith('-')) fileName = arg;
        });

        if (!fileName) {
            output = missingArgumentError('uniq', 'file');
        } else {
            const resolved = resolvePath(fileName);
            const fileObj = getPathObject(resolved);

            if (!fileObj) {
                output = noSuchFileError(fileName);
            } else if (fileObj.type === 'directory') {
                output = `bash: uniq: ${fileName}: Is a directory`;
            } else if (fileObj.type === 'file') {
                // Check read permission
                if (!canRead(fileObj, currentUser)) {
                    output = `bash: uniq: ${fileName}: Permission denied`;
                } else {
                    const lines = fileObj.content.split('\n').filter(line => line.trim());
                    const lineCount = {};
                    const result = [];

                    // Count occurrences of each line
                    lines.forEach(line => {
                        lineCount[line] = (lineCount[line] || 0) + 1;
                    });

                    // Process based on options
                    Object.entries(lineCount).forEach(([line, count]) => {
                        let shouldInclude = false;

                        if (uniqueOnly && count === 1) {
                            shouldInclude = true;
                        } else if (duplicateOnly && count > 1) {
                            shouldInclude = true;
                        } else if (!uniqueOnly && !duplicateOnly) {
                            shouldInclude = true;
                        }

                        if (shouldInclude) {
                            if (countMode) {
                                result.push(`${count} ${line}`);
                            } else {
                                result.push(line);
                            }
                        }
                    });

                    output = result.length > 0 ? result.join('\r\n') : '';
                }
            }
        }
    }

    return output;
};
