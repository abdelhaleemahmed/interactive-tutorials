// js/commands/chown.js

import { getPathObject, resolvePath } from '../terminalUtils.js';
import { noSuchFileError, missingArgumentError } from '../errorMessages.js';
import { getCurrentUser, getUser } from '../userManagement.js';

/**
 * chown command - Change file ownership
 * Usage: chown <user>:<group> <file>
 * Example: chown guest:guest myfile.txt
 *
 * Only root can change ownership
 */
export const chownCommand = (args) => {
    let output = '';
    const currentUser = getCurrentUser();

    if (args.length < 2) {
        output = 'bash: chown: missing arguments\r\nUsage: chown <user>:<group> <file>';
    } else {
        const ownershipString = args[0];
        const fileName = args[1];

        // Parse user:group format
        const parts = ownershipString.split(':');
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
            output = `bash: chown: invalid format '${ownershipString}'\r\nUsage: chown <user>:<group> <file>`;
        } else {
            const newUser = parts[0];
            const newGroup = parts[1];

            // Only root can change ownership
            if (!currentUser.isRoot) {
                output = 'bash: chown: operation not permitted';
            } else {
                const resolved = resolvePath(fileName);
                const fileObj = getPathObject(resolved);

                if (!fileObj) {
                    output = noSuchFileError(fileName);
                } else {
                    // Verify user exists
                    const userObj = getUser(newUser);
                    if (!userObj) {
                        output = `bash: chown: invalid user '${newUser}'`;
                    } else {
                        // Change ownership
                        fileObj.owner = newUser;
                        fileObj.group = newGroup;
                        // Update modification timestamp
                        fileObj.modified = Date.now();
                        output = '';  // chown returns empty on success
                    }
                }
            }
        }
    }

    return output;
};
