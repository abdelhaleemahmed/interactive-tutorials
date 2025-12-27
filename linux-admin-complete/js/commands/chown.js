// js/commands/chown.js

import { getPathObject, resolvePath } from '../terminalUtils.js';
import { noSuchFileError, missingArgumentError } from '../errorMessages.js';
import { getCurrentUser, getUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * chown command - Change file ownership
 * Usage: chown <user>:<group> <file>
 * Example: chown guest:guest myfile.txt
 *
 * Only root can change ownership
 */
export const chownCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('chown', args);
    if (!validation.valid) {
        return validation.error;
    }

    const { nonFlags } = validation;
    let output = '';
    const currentUser = getCurrentUser();

    const ownershipString = nonFlags[0];
    const fileName = nonFlags[1];

    // Parse ownership format: supports user, :group, or user:group
    let newUser = null;
    let newGroup = null;

    if (ownershipString.includes(':')) {
        const parts = ownershipString.split(':');
        newUser = parts[0] || null;  // Empty string before : means keep current user
        newGroup = parts[1] || null;  // Empty string after : means keep current group
    } else {
        // No colon means changing only the user
        newUser = ownershipString;
    }

    // Validate that at least one of user or group is being changed
    if (!newUser && !newGroup) {
        return `bash: chown: invalid format '${ownershipString}'\r\nUsage: chown [user][:group] <file>`;
    }

    const resolved = resolvePath(fileName);
    const fileObj = getPathObject(resolved);

    if (!fileObj) {
        return noSuchFileError(fileName);
    }

    // In real Linux, only root can chown. But for learning purposes, we'll allow it
    // with a warning if not root
    if (!currentUser.isRoot && currentUser.username !== fileObj.owner) {
        return 'chown: changing ownership: Operation not permitted\r\n(Note: In real Linux, only root or the file owner can change ownership)';
    }

    // Change ownership
    if (newUser) {
        // Verify user exists (in a real system)
        const userObj = getUser(newUser);
        if (!userObj && newUser !== 'john' && newUser !== 'guest') {
            // Allow john and guest even if not in user system
            return `chown: invalid user: '${newUser}'`;
        }
        fileObj.owner = newUser;
    }

    if (newGroup) {
        // For simplicity, allow any group name
        fileObj.group = newGroup;
    }

    // Update modification timestamp
    fileObj.modified = Date.now();
    output = '';  // chown returns empty on success

    return output;
};
