// js/commands/groupadd.js

import { getPathObject, resolvePath } from '../terminalUtils.js';
import { getCurrentUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * groupadd command - Add a new group to the system
 * Usage: groupadd <groupname>
 * Example: sudo groupadd developers
 *
 * Only root can add groups
 */
export const groupaddCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('groupadd', args);
    if (!validation.valid) {
        return validation.error;
    }

    const { nonFlags } = validation;
    const groupName = nonFlags[0];

    if (!groupName) {
        return 'groupadd: missing group name\r\nusage: groupadd <groupname>';
    }

    const currentUser = getCurrentUser();

    // Only root can add groups
    if (!currentUser.isRoot) {
        return 'groupadd: Permission denied';
    }

    // Get /etc/group file
    const resolvedPath = resolvePath('/etc/group');
    const groupFile = getPathObject(resolvedPath);
    if (!groupFile) {
        return 'groupadd: /etc/group: No such file or directory';
    }

    // Check if group already exists
    const lines = groupFile.content.split('\n');
    const groupExists = lines.some(line => {
        const parts = line.split(':');
        return parts[0] === groupName;
    });

    if (groupExists) {
        return `groupadd: group '${groupName}' already exists`;
    }

    // Find the next available GID (starting from 1005)
    let nextGid = 1005;
    lines.forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 3) {
            const gid = parseInt(parts[2], 10);
            if (gid >= nextGid) {
                nextGid = gid + 1;
            }
        }
    });

    // Add the new group to /etc/group
    const newGroupLine = `${groupName}:x:${nextGid}:`;
    groupFile.content += `\n${newGroupLine}`;
    groupFile.modified = Date.now();

    return ''; // Success - no output
};
