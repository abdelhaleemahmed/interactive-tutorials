// js/commands/wc.js

import { getPathObject, resolvePath, canRead } from '../terminalUtils.js';
import { noSuchFileError, missingArgumentError } from '../errorMessages.js';
import { getCurrentUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

export const wcCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('wc', args);
    if (!validation.valid) {
        return validation.error;
    }

    let output = '';
    const currentUser = getCurrentUser();

    if (args.length === 0) {
        output = missingArgumentError('wc', 'operand');
    } else {
        let fileName = args[0];
        let showLines = true;
        let showWords = true;
        let showBytes = true;

        // Handle options: -l (lines), -w (words), -c (bytes)
        args.forEach(arg => {
            if (arg === '-l' || arg === '-w' || arg === '-c') {
                showLines = false;
                showWords = false;
                showBytes = false;
            }
            if (arg === '-l') showLines = true;
            if (arg === '-w') showWords = true;
            if (arg === '-c') showBytes = true;
            if (!arg.startsWith('-')) fileName = arg;
        });

        if (!fileName) {
            output = missingArgumentError('wc', 'file');
        } else {
            const resolved = resolvePath(fileName);
            const fileObj = getPathObject(resolved);

            if (!fileObj) {
                output = noSuchFileError(fileName);
            } else if (fileObj.type === 'directory') {
                output = `bash: wc: ${fileName}: Is a directory`;
            } else if (fileObj.type === 'file') {
                // Check read permission
                if (!canRead(fileObj, currentUser)) {
                    output = `bash: wc: ${fileName}: Permission denied`;
                } else {
                    const content = fileObj.content;

                    // Count lines
                    const lines = content.split('\n').length - 1; // -1 because split includes empty last element if ends with newline

                    // Count words
                    const words = content.match(/\b\w+\b/g)?.length || 0;

                    // Count bytes/characters
                    const bytes = content.length;

                    // Format output based on options
                    let parts = [];
                    if (showLines) parts.push(lines.toString().padStart(7));
                    if (showWords) parts.push(words.toString().padStart(7));
                    if (showBytes) parts.push(bytes.toString().padStart(7));

                    output = parts.join(' ') + ` ${fileName}`;
                }
            }
        }
    }

    return output;
};
