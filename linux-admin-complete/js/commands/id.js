
// js/commands/id.js

import { getCurrentUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

export const idCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('id', args);
    if (!validation.valid) {
        return validation.error;
    }

    const user = getCurrentUser();

    // Display user ID, group ID, and groups
    // Format matches Linux id command output
    const uid = user.uid || 1000;
    const gid = user.gid || 1000;
    const username = user.username || 'user';
    const groupname = user.username || 'user'; // Primary group usually matches username

    // Additional groups the user belongs to
    const groups = user.groups || [groupname, 'sudo', 'www-data'];
    const groupsStr = groups.map((g, i) => {
        const groupGid = i === 0 ? gid : 1000 + i;
        return `${groupGid}(${g})`;
    }).join(',');

    return `uid=${uid}(${username}) gid=${gid}(${groupname}) groups=${groupsStr}`;
};
