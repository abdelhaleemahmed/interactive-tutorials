// js/commands/groups.js

import { getCurrentUser, getUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * groups command - Display group memberships
 * Usage: groups [USERNAME]
 * Example: groups john
 */
export const groupsCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('groups', args);
    if (!validation.valid) {
        return validation.error;
    }

    const { nonFlags } = validation;
    const targetUsername = nonFlags[0];

    let targetUser;
    if (targetUsername) {
        targetUser = getUser(targetUsername);
        if (!targetUser) {
            return `groups: '${targetUsername}': no such user`;
        }
    } else {
        targetUser = getCurrentUser();
    }

    // Get groups for the user
    const username = targetUser.username || 'user';
    const groups = targetUser.groups || [username, 'sudo', 'www-data'];

    // Format: username : group1 group2 group3
    return `${username} : ${groups.join(' ')}`;
};
