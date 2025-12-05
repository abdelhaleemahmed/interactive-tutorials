
// js/terminalUtils.js

// Simulated File System (exported for access by commands)
// Enhanced with owner, group, and numeric permissions (octal notation)
export const fileSystem = {
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
        }
    }
};

export let currentPath = ['home', 'user'];
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
    const types = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
    const owner = types[(perms >> 6) & 7];
    const group = types[(perms >> 3) & 7];
    const other = types[perms & 7];
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
