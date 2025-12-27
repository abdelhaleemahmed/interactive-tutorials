// js/commands/sudo.js

import { getCurrentUser, setCurrentUser, getUser } from '../userManagement.js';

/**
 * sudo command - Execute a command as root
 * Usage: sudo <command> [args...]
 * Example: sudo chown root:root file.txt
 *
 * In this tutorial environment, sudo temporarily elevates privileges to root
 */
export const sudoCommand = (args, handlers) => {
    if (args.length === 0) {
        return 'usage: sudo <command> [arguments]';
    }

    const currentUser = getCurrentUser();

    // Check if user is allowed to use sudo (typically users in sudo group)
    const userGroups = currentUser.groups || [];
    if (!currentUser.isRoot && !userGroups.includes('sudo')) {
        return `${currentUser.username} is not in the sudoers file. This incident will be reported.`;
    }

    // Get the command and its arguments
    const commandName = args[0];
    const commandArgs = args.slice(1);

    // Check if command exists
    if (!handlers || !handlers[commandName]) {
        return `sudo: ${commandName}: command not found`;
    }

    // Temporarily become root
    const rootUser = {
        username: 'root',
        uid: 0,
        gid: 0,
        isRoot: true,
        groups: ['root']
    };

    setCurrentUser(rootUser);

    try {
        // Execute the command as root
        const result = handlers[commandName](commandArgs);

        // Restore original user
        setCurrentUser(currentUser);

        return result;
    } catch (error) {
        // Restore original user even if command fails
        setCurrentUser(currentUser);
        return `sudo: ${commandName}: ${error.message}`;
    }
};
