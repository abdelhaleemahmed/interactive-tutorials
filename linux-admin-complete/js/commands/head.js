// js/commands/head.js

import { getPathObject, resolvePath, canRead } from '../terminalUtils.js';
import { noSuchFileError } from '../errorMessages.js';
import { getCurrentUser } from '../userManagement.js';
import { validateArgs, getFlagValue } from '../argumentValidator.js';

export const headCommand = (args) => {
    let output = '';
    const currentUser = getCurrentUser();
    let lines = 10; // Default number of lines
    let fileName = null;

    // Parse arguments manually to handle both -n NUM and -NUM syntax
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        // Check for -NUM shorthand (e.g., -10, -5)
        if (/^-\d+$/.test(arg)) {
            lines = parseInt(arg.substring(1), 10);
        }
        // Check for -n flag with value
        else if (arg === '-n' && i + 1 < args.length) {
            lines = parseInt(args[i + 1], 10);
            i++; // Skip next arg since we consumed it
            if (isNaN(lines)) {
                return `head: invalid number of lines: '${args[i]}'`;
            }
        }
        // Check for other flags
        else if (arg.startsWith('-')) {
            // Other flags can be validated normally
            const validation = validateArgs('head', [arg]);
            if (!validation.valid) {
                return validation.error;
            }
        }
        // Otherwise it's a filename
        else {
            fileName = arg;
        }
    }

    if (!fileName) {
        return 'head: missing file operand';
    }

    const resolved = resolvePath(fileName);
    const fileObj = getPathObject(resolved);

    if (!fileObj) {
        output = noSuchFileError(fileName);
    } else if (fileObj.type === 'directory') {
        output = `bash: head: ${fileName}: Is a directory`;
    } else if (fileObj.type === 'file') {
        // Check read permission
        if (!canRead(fileObj, currentUser)) {
            output = `bash: head: ${fileName}: Permission denied`;
        } else {
            const fileLines = fileObj.content.split('\n');
            const headLines = fileLines.slice(0, lines);
            output = headLines.join('\r\n');
        }
    }

    return output;
};
