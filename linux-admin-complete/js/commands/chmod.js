// js/commands/chmod.js

import { getPathObject, resolvePath } from '../terminalUtils.js';
import { noSuchFileError, missingArgumentError } from '../errorMessages.js';
import { getCurrentUser } from '../userManagement.js';

/**
 * chmod command - Change file/directory permissions
 * Usage: chmod <mode> <file>
 * Mode: Octal notation (e.g., 755, 644, 600, 777)
 *
 * Only file owner or root can change permissions
 */
export const chmodCommand = (args) => {
    let output = '';
    const currentUser = getCurrentUser();

    if (args.length < 2) {
        output = 'bash: chmod: missing arguments\r\nUsage: chmod <mode> <file>';
    } else {
        const modeString = args[0];
        const fileName = args[1];

        // Parse octal mode
        const mode = parseInt(modeString, 8);

        // Validate mode is a valid octal number
        if (isNaN(mode) || modeString.length !== 3) {
            output = `bash: chmod: '${modeString}': invalid mode`;
        } else {
            const resolved = resolvePath(fileName);
            const fileObj = getPathObject(resolved);

            if (!fileObj) {
                output = noSuchFileError(fileName);
            } else {
                // Check if user is owner or root
                if (fileObj.owner !== currentUser.username && !currentUser.isRoot) {
                    output = `bash: chmod: ${fileName}: Operation not permitted`;
                } else {
                    // Change the permissions
                    fileObj.permissions = mode;
                    // Update modification timestamp
                    fileObj.modified = Date.now();
                    output = '';  // chmod returns empty on success
                }
            }
        }
    }

    return output;
};
