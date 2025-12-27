// js/commands/su.js

import { getUser, setCurrentUser, getCurrentUser } from '../userManagement.js';
import { updateCurrentPath, getCurrentDir } from '../terminalUtils.js';
import { updateUser, updatePWD } from '../environmentVariables.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * su command - Switch user
 * Usage: su [username]
 *
 * Without arguments, switches to root user
 * With username, switches to that user
 * Updates current path to user's home directory
 * Updates environment variables (USER, HOME, LOGNAME, PWD)
 */
export const suCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('su', args);
    if (!validation.valid) {
        return validation.error;
    }

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
        const newDir = getCurrentDir();

        // Update environment variables for new user
        updateUser(newUser.username, newUser.home);
        updatePWD(newDir);

        output = ``;  // su typically doesn't produce output on success
    }

    return output;
};
