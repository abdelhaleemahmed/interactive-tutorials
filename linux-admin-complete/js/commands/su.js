// js/commands/su.js

import { getUser, setCurrentUser, getCurrentUser } from '../userManagement.js';
import { updateCurrentPath } from '../terminalUtils.js';

/**
 * su command - Switch user
 * Usage: su [username]
 *
 * Without arguments, switches to root user
 * With username, switches to that user
 * Updates current path to user's home directory
 */
export const suCommand = (args) => {
    let output = '';
    let targetUser = args.length > 0 ? args[0] : 'root';

    // Check if user exists
    const userObj = getUser(targetUser);
    if (!userObj) {
        output = `su: user ${targetUser} does not exist`;
    } else {
        // Switch to the target user
        setCurrentUser(targetUser);

        // Reset current path to user's home directory
        if (targetUser === 'root') {
            updateCurrentPath(['root']);
        } else if (targetUser === 'user') {
            updateCurrentPath(['home', 'user']);
        } else if (targetUser === 'guest') {
            updateCurrentPath(['home', 'guest']);
        }

        const newUser = getCurrentUser();
        const promptChar = newUser.isRoot ? '#' : '$';
        output = ``;  // su typically doesn't produce output on success
    }

    return output;
};
