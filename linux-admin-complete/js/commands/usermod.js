// js/commands/usermod.js

import { getPathObject, resolvePath } from '../terminalUtils.js';
import { getCurrentUser, getUser } from '../userManagement.js';
import { validateArgs, hasFlag } from '../argumentValidator.js';

/**
 * usermod command - Modify user account
 * Usage: usermod [options] LOGIN
 * Example: sudo usermod -aG developers john
 *
 * Common options:
 *   -a, --append     Append user to supplementary groups (use with -G)
 *   -G, --groups     List of supplementary groups
 *
 * Only root can modify users
 */
export const usermodCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('usermod', args);
    if (!validation.valid) {
        return validation.error;
    }

    const { flags, nonFlags } = validation;
    const username = nonFlags[nonFlags.length - 1]; // Last non-flag arg is username

    if (!username) {
        return 'usermod: missing username\r\nusage: usermod [options] LOGIN';
    }

    const currentUser = getCurrentUser();

    // Only root can modify users
    if (!currentUser.isRoot) {
        return 'usermod: Permission denied';
    }

    // Check if user exists
    const targetUser = getUser(username);
    if (!targetUser && username !== 'john' && username !== 'guest') {
        return `usermod: user '${username}' does not exist`;
    }

    // Handle -G flag (set groups)
    const hasGroupFlag = hasFlag(flags, 'G');
    const hasAppendFlag = hasFlag(flags, 'a');

    if (hasGroupFlag) {
        // Find the groups argument (comes after -G flag or after combined flags like -aG)
        let groupsArg = null;

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            // Check for -G as standalone flag
            if (arg === '-G' && i + 1 < args.length) {
                groupsArg = args[i + 1];
                break;
            }
            // Check for -G in combined flags like -aG
            if (arg.startsWith('-') && arg.includes('G') && i + 1 < args.length) {
                // Next arg should be the groups value
                const nextArg = args[i + 1];
                if (!nextArg.startsWith('-') && nextArg !== username) {
                    groupsArg = nextArg;
                    break;
                }
            }
        }

        if (!groupsArg) {
            return 'usermod: option requires an argument -- \'G\'';
        }

        const newGroups = groupsArg.split(',');

        // Get /etc/group file
        const resolvedPath = resolvePath('/etc/group');
        const groupFile = getPathObject(resolvedPath);
        if (!groupFile) {
            return 'usermod: /etc/group: No such file or directory';
        }

        // Verify all groups exist
        const lines = groupFile.content.split('\n');
        const existingGroups = lines.map(line => {
            const parts = line.split(':');
            return parts[0];
        }).filter(g => g);

        for (const group of newGroups) {
            if (!existingGroups.includes(group)) {
                return `usermod: group '${group}' does not exist`;
            }
        }

        // Update /etc/group file to add user to groups
        const updatedLines = lines.map(line => {
            const parts = line.split(':');
            const groupName = parts[0];
            const members = parts[3] ? parts[3].split(',').filter(m => m) : [];

            if (newGroups.includes(groupName)) {
                // Add user to this group if not already a member
                if (!members.includes(username)) {
                    if (hasAppendFlag) {
                        // Append mode: add to existing members
                        members.push(username);
                    } else {
                        // Replace mode: user becomes only member
                        members.length = 0;
                        members.push(username);
                    }
                }
            } else if (!hasAppendFlag) {
                // If not in append mode, remove user from other groups
                const index = members.indexOf(username);
                if (index > -1) {
                    members.splice(index, 1);
                }
            }

            // Reconstruct the line
            parts[3] = members.join(',');
            return parts.join(':');
        });

        groupFile.content = updatedLines.join('\n');
        groupFile.modified = Date.now();

        // Update user object if it exists
        if (targetUser) {
            if (hasAppendFlag) {
                // Append mode: add new groups to existing
                const currentGroups = targetUser.groups || [username];
                targetUser.groups = [...new Set([...currentGroups, ...newGroups])];
            } else {
                // Replace mode: set groups
                targetUser.groups = [username, ...newGroups];
            }
        }
    }

    return ''; // Success - no output
};
