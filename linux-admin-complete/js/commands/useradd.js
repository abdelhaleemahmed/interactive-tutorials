// js/commands/useradd.js

import { getCurrentUser, addUser, userExists } from '../userManagement.js';
import { validateArgs, hasFlag } from '../argumentValidator.js';
import { resolvePath, getPathObject, fileSystem, getCurrentDateFormatted } from '../terminalUtils.js';
import { getDirectoryPermissions } from '../umask.js';

/**
 * useradd command - Create a new user account
 * Usage: useradd [options] username
 * Options:
 *   -m    Create home directory
 *   -g    Primary group (not implemented for simplicity)
 *   -s    Login shell (not implemented for simplicity)
 *
 * Note: Requires sudo/root privileges
 */
export const useraddCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('useradd', args);
    if (!validation.valid) {
        return validation.error;
    }

    const { flags, nonFlags } = validation;
    const currentUser = getCurrentUser();

    // Check if running as root
    if (!currentUser.isRoot) {
        return 'useradd: Permission denied (must be root)';
    }

    // Get username
    const username = nonFlags[0];
    if (!username) {
        return 'useradd: missing username\r\nUsage: useradd [options] username';
    }

    // Validate username format (alphanumeric, underscore, dash)
    if (!/^[a-z_][a-z0-9_-]*$/.test(username)) {
        return `useradd: invalid username '${username}'`;
    }

    // Check if user already exists
    if (userExists(username)) {
        return `useradd: user '${username}' already exists`;
    }

    // Create the user
    const newUser = addUser(username);

    // If -m flag is set, create home directory
    const createHome = hasFlag(flags, 'm');
    if (createHome) {
        const homePath = `/home/${username}`;
        const resolved = resolvePath(homePath);

        // Check if home directory already exists
        const existing = getPathObject(resolved);
        if (existing) {
            return `useradd: warning: home directory '${homePath}' already exists`;
        }

        // Get /home directory
        const homeDir = getPathObject(['home']);
        if (!homeDir) {
            return `useradd: cannot create directory '${homePath}': /home does not exist`;
        }

        // Create user's home directory
        const dirPerms = 0o755; // rwxr-xr-x for home directories
        homeDir.children[username] = {
            type: 'directory',
            owner: username,
            group: username,
            permissions: dirPerms,
            created: Date.now(),
            modified: Date.now(),
            children: {},
            date: getCurrentDateFormatted(),
            size: 4096
        };
    }

    // Update /etc/passwd file
    const passwdPath = resolvePath('/etc/passwd');
    const passwdFile = getPathObject(passwdPath);

    if (passwdFile) {
        // Format: username:x:uid:gid:comment:home:shell
        const entry = `${username}:x:${newUser.uid}:${newUser.gid}:${username}:/home/${username}:/bin/bash`;
        passwdFile.content += `\n${entry}`;
        passwdFile.size = passwdFile.content.length;
        passwdFile.modified = Date.now();
    }

    // Success - no output (standard useradd behavior)
    return '';
};
