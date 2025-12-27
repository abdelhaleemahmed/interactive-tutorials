
// js/terminalUtils.js

import {
    loadFilesystem,
    saveFilesystem,
    loadCurrentPath,
    saveCurrentPath,
    createAutoSave
} from './filesystemPersistence.js';

// Default File System (used when no saved state exists)
// Enhanced with owner, group, and numeric permissions (octal notation)
function createDefaultFileSystem() {
    return {
        type: 'directory',
        owner: 'root',
        group: 'root',
        permissions: 0o755,  // drwxr-xr-x
        created: Date.now(),
        modified: Date.now(),
        children: {
            'home': {
                type: 'directory',
                owner: 'root',
                group: 'root',
                permissions: 0o755,  // drwxr-xr-x
                created: Date.now(),
                modified: Date.now(),
                children: {
                    'user': {
                        type: 'directory',
                        owner: 'user',
                        group: 'user',
                        permissions: 0o755,  // drwxr-xr-x
                        created: Date.now(),
                        modified: Date.now(),
                        children: {
                            'documents': {
                                type: 'directory',
                                owner: 'user',
                                group: 'user',
                                permissions: 0o755,  // drwxr-xr-x
                                created: Date.now(),
                                modified: Date.now(),
                                children: {
                                    'report.txt': {
                                        type: 'file',
                                        owner: 'user',
                                        group: 'user',
                                        permissions: 0o644,  // -rw-r--r--
                                        created: Date.now(),
                                        modified: Date.now(),
                                        content: 'This is a sample report file.\nIt contains some important information.',
                                        size: 60
                                    },
                                    'notes.md': {
                                        type: 'file',
                                        owner: 'user',
                                        group: 'user',
                                        permissions: 0o644,  // -rw-r--r--
                                        created: Date.now(),
                                        modified: Date.now(),
                                        content: '# My Notes\n\n- Idea 1\n- Idea 2\n- Idea 3',
                                        size: 40
                                    }
                                }
                            },
                            'projects': {
                                type: 'directory',
                                owner: 'user',
                                group: 'user',
                                permissions: 0o755,  // drwxr-xr-x
                                created: Date.now(),
                                modified: Date.now(),
                                children: {
                                    'my_blog': {
                                        type: 'directory',
                                        owner: 'user',
                                        group: 'user',
                                        permissions: 0o755,  // drwxr-xr-x
                                        created: Date.now(),
                                        modified: Date.now(),
                                        children: {
                                            'index.html': { type: 'file', owner: 'user', group: 'user', permissions: 0o644, created: Date.now(), modified: Date.now(), content: '<!DOCTYPE html>...', size: 200 },
                                            'style.css': { type: 'file', owner: 'user', group: 'user', permissions: 0o644, created: Date.now(), modified: Date.now(), content: 'body { color: blue; }', size: 50 },
                                            'script.js': { type: 'file', owner: 'user', group: 'user', permissions: 0o644, created: Date.now(), modified: Date.now(), content: '// JavaScript code', size: 30 }
                                        }
                                    },
                                    'game_dev': {
                                        type: 'directory',
                                        owner: 'user',
                                        group: 'user',
                                        permissions: 0o755,  // drwxr-xr-x
                                        created: Date.now(),
                                        modified: Date.now(),
                                        children: {
                                            'main.py': { type: 'file', owner: 'user', group: 'user', permissions: 0o644, created: Date.now(), modified: Date.now(), content: 'print(\"Hello Game!\")', size: 20 },
                                            'assets': { type: 'directory', owner: 'user', group: 'user', permissions: 0o755, created: Date.now(), modified: Date.now(), children: {} }
                                        }
                                    }
                                }
                            },
                            'downloads': {
                                type: 'directory',
                                owner: 'user',
                                group: 'user',
                                permissions: 0o755,  // drwxr-xr-x
                                created: Date.now(),
                                modified: Date.now(),
                                children: {}
                            },
                            'README.txt': {
                                type: 'file',
                                owner: 'user',
                                group: 'user',
                                permissions: 0o644,  // -rw-r--r--
                                created: Date.now(),
                                modified: Date.now(),
                                content: 'Welcome to your simulated home directory!\n\nTry `ls -l` for more details.',
                                size: 70
                            }
                        }
                    },
                    'guest': {
                        type: 'directory',
                        owner: 'guest',
                        group: 'guest',
                        permissions: 0o755,  // drwxr-xr-x
                        created: Date.now(),
                        modified: Date.now(),
                        children: {}
                    }
                }
            },
            'root': {
                type: 'directory',
                owner: 'root',
                group: 'root',
                permissions: 0o700,  // drwx------
                created: Date.now(),
                modified: Date.now(),
                children: {}
            },
            'etc': {
                type: 'directory',
                owner: 'root',
                group: 'root',
                permissions: 0o755,  // drwxr-xr-x
                created: Date.now(),
                modified: Date.now(),
                children: {
                    'passwd': {
                        type: 'file',
                        owner: 'root',
                        group: 'root',
                        permissions: 0o644,  // -rw-r--r--
                        created: Date.now(),
                        modified: Date.now(),
                        date: 'Jan 01 00:00',
                        content: 'root:x:0:0:root:/root:/bin/bash\n' +
                                'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n' +
                                'bin:x:2:2:bin:/bin:/usr/sbin/nologin\n' +
                                'sys:x:3:3:sys:/dev:/usr/sbin/nologin\n' +
                                'sync:x:4:65534:sync:/bin:/bin/sync\n' +
                                'user:x:1000:1000:User,,,:/home/user:/bin/bash\n' +
                                'guest:x:1001:1001:Guest User:/home/guest:/bin/bash\n' +
                                'john:x:1002:1002:John Doe:/home/john:/bin/bash\n' +
                                'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n' +
                                'nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin',
                        size: 500
                    },
                    'group': {
                        type: 'file',
                        owner: 'root',
                        group: 'root',
                        permissions: 0o644,  // -rw-r--r--
                        created: Date.now(),
                        modified: Date.now(),
                        date: 'Jan 01 00:00',
                        content: 'root:x:0:\n' +
                                'daemon:x:1:\n' +
                                'bin:x:2:\n' +
                                'sys:x:3:\n' +
                                'adm:x:4:\n' +
                                'tty:x:5:\n' +
                                'disk:x:6:\n' +
                                'lp:x:7:\n' +
                                'mail:x:8:\n' +
                                'news:x:9:\n' +
                                'uucp:x:10:\n' +
                                'sudo:x:27:user\n' +
                                'www-data:x:33:user\n' +
                                'user:x:1000:\n' +
                                'guest:x:1001:\n' +
                                'john:x:1002:\n' +
                                'staff:x:1003:john\n' +
                                'developers:x:1004:user,john\n' +
                                'nogroup:x:65534:',
                        size: 300
                    }
                }
            }
        }
    };
}

// Initialize filesystem from localStorage or default
export const fileSystem = loadFilesystem(createDefaultFileSystem());

// Initialize current path from localStorage or default
export let currentPath = loadCurrentPath(['home', 'user']);

// Create auto-save function (debounced to 500ms)
const autoSaveFileSystem = createAutoSave(saveFilesystem, 500);

// Export function to trigger filesystem save
export function triggerFilesystemSave() {
    autoSaveFileSystem(fileSystem);
}
export const user = 'bloguser';
export const hostname = 'bloghost';
export const defaultDirPermissions = 'drwxr-xr-x';
export const defaultFilePermissions = '-rw-r--r--';
export const defaultOwner = 'user';
export const defaultGroup = 'user';

export function getCurrentDateFormatted() {
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[now.getMonth()];
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${month} ${day} ${hours}:${minutes}`;
}

export function writePrompt(term) {
    const pathDisplay = currentPath.length === 0 ? '/' : '/' + currentPath.join('/');
    term.write(`\x1B[1;32m${user}@${hostname}\x1B[0m:\x1B[1;34m${pathDisplay}\x1B[0m$ `);
}

export function getCurrentDir() {
    let dir = fileSystem;
    for (const segment of currentPath) {
        if (dir.children && dir.children[segment]) {
            dir = dir.children[segment];
        } else {
            return null;
        }
    }
    return dir;
}

export function getPathObject(pathSegments) {
    let current = fileSystem;
    for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        if (current.children && current.children[segment]) {
            current = current.children[segment];
        } else {
            return null;
        }
    }
    return current;
}

export function resolvePath(targetPath) {
    const pathSegments = targetPath.split('/').filter(s => s !== '');
    let resolved;

    if (targetPath.startsWith('/')) {
        resolved = [];
    } else {
        resolved = [...currentPath];
    }

    for (const segment of pathSegments) {
        if (segment === '..') {
            if (resolved.length > 0) {
                resolved.pop();
            }
        } else if (segment === '.') {
            // Do nothing
        } else if (segment === '~') {
            resolved = ['home', 'user'];
        } else {
            resolved.push(segment);
        }
    }
    return resolved;
}

export function updateCurrentPath(newPathArray) {
    currentPath = newPathArray;
    saveCurrentPath(currentPath);  // Persist path changes
}

// ==========================================
// Permission System Functions
// ==========================================

/**
 * Convert numeric octal permissions to string format
 * @param {number} perms - Octal permissions (e.g., 0o755)
 * @returns {string} String format (e.g., "rwxr-xr-x")
 */
export function permissionToString(perms) {
    // Extract special bits
    const suid = (perms & 0o4000) !== 0;
    const sgid = (perms & 0o2000) !== 0;
    const sticky = (perms & 0o1000) !== 0;

    // Extract regular permission bits (lower 9 bits)
    const regularPerms = perms & 0o777;

    const types = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
    let owner = types[(regularPerms >> 6) & 7];
    let group = types[(regularPerms >> 3) & 7];
    let other = types[regularPerms & 7];

    // Apply SUID to owner execute position
    if (suid) {
        const hasOwnerExec = (regularPerms & 0o100) !== 0;
        owner = owner.substring(0, 2) + (hasOwnerExec ? 's' : 'S');
    }

    // Apply SGID to group execute position
    if (sgid) {
        const hasGroupExec = (regularPerms & 0o010) !== 0;
        group = group.substring(0, 2) + (hasGroupExec ? 's' : 'S');
    }

    // Apply sticky bit to other execute position
    if (sticky) {
        const hasOtherExec = (regularPerms & 0o001) !== 0;
        other = other.substring(0, 2) + (hasOtherExec ? 't' : 'T');
    }

    return owner + group + other;
}

/**
 * Convert string format permissions to octal
 * @param {string} str - Permission string (e.g., "rwxr-xr-x")
 * @returns {number} Octal permissions (e.g., 0o755)
 */
export function stringToPermission(str) {
    if (str.length !== 9) return 0o644;  // Default fallback

    const values = { 'r': 4, 'w': 2, 'x': 1, '-': 0 };
    const owner = (values[str[0]] || 0) + (values[str[1]] || 0) + (values[str[2]] || 0);
    const group = (values[str[3]] || 0) + (values[str[4]] || 0) + (values[str[5]] || 0);
    const other = (values[str[6]] || 0) + (values[str[7]] || 0) + (values[str[8]] || 0);

    return parseInt(`0${owner}${group}${other}`, 8);
}

/**
 * Check if a user has a specific permission on a file
 * @param {Object} fileObj - The file/directory object
 * @param {Object} user - The user object
 * @param {string} operation - 'read', 'write', or 'execute'
 * @returns {boolean} True if user has permission
 */
export function canAccess(fileObj, user, operation) {
    // Root can always access anything
    if (user.isRoot) {
        return true;
    }

    // Determine the required bit
    let requiredBit;
    switch (operation) {
        case 'read':
            requiredBit = 4;  // r
            break;
        case 'write':
            requiredBit = 2;  // w
            break;
        case 'execute':
            requiredBit = 1;  // x
            break;
        default:
            return false;
    }

    // Check owner permissions
    if (fileObj.owner === user.username) {
        const ownerPerms = (fileObj.permissions >> 6) & 7;
        return (ownerPerms & requiredBit) !== 0;
    }

    // Check group permissions
    if (user.groups && user.groups.includes(fileObj.group)) {
        const groupPerms = (fileObj.permissions >> 3) & 7;
        return (groupPerms & requiredBit) !== 0;
    }

    // Check other permissions
    const otherPerms = fileObj.permissions & 7;
    return (otherPerms & requiredBit) !== 0;
}

/**
 * Check if user can read a file
 * @param {Object} fileObj - The file object
 * @param {Object} user - The user object
 * @returns {boolean} True if user can read
 */
export function canRead(fileObj, user) {
    return canAccess(fileObj, user, 'read');
}

/**
 * Check if user can write to a file
 * @param {Object} fileObj - The file object
 * @param {Object} user - The user object
 * @returns {boolean} True if user can write
 */
export function canWrite(fileObj, user) {
    return canAccess(fileObj, user, 'write');
}

/**
 * Check if user can execute a file
 * @param {Object} fileObj - The file object
 * @param {Object} user - The user object
 * @returns {boolean} True if user can execute
 */
export function canExecute(fileObj, user) {
    return canAccess(fileObj, user, 'execute');
}

/**
 * Expand wildcards in arguments against the current directory
 * @param {Array<string>} args - Command arguments that may contain wildcards
 * @returns {Array<string>} Expanded arguments with wildcards replaced by matching filenames
 */
export function expandWildcards(args) {
    const currentDir = getCurrentDir();
    if (!currentDir || !currentDir.children) {
        return args;
    }

    const expandedArgs = [];

    for (const arg of args) {
        // Check if argument contains wildcard characters
        if (arg.includes('*') || arg.includes('?') || arg.includes('[')) {
            // Convert glob pattern to regex
            const pattern = globToRegex(arg);
            const matches = Object.keys(currentDir.children).filter(name => pattern.test(name));

            if (matches.length > 0) {
                // Sort matches alphabetically (like bash does)
                matches.sort();
                expandedArgs.push(...matches);
            } else {
                // No matches - keep the original pattern (bash behavior)
                expandedArgs.push(arg);
            }
        } else {
            // No wildcard - keep as is
            expandedArgs.push(arg);
        }
    }

    return expandedArgs;
}

/**
 * Convert a glob pattern to a regular expression
 * @param {string} glob - Glob pattern (e.g., "*.txt", "file?.js")
 * @returns {RegExp} Regular expression that matches the pattern
 */
function globToRegex(glob) {
    // Escape special regex characters except *, ?, and []
    let pattern = glob.replace(/[.+^${}()|\\]/g, '\\$&');

    // Convert glob wildcards to regex
    pattern = pattern.replace(/\*/g, '.*');  // * matches any characters
    pattern = pattern.replace(/\?/g, '.');   // ? matches single character

    // Handle character classes [abc] - already valid regex, no conversion needed

    // Anchor to match full filename
    pattern = '^' + pattern + '$';

    return new RegExp(pattern);
}
