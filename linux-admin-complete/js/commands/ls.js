
// js/commands/ls.js

import {
    fileSystem, currentPath, user, hostname,
    defaultDirPermissions, defaultFilePermissions, defaultOwner, defaultGroup,
    getCurrentDateFormatted, getCurrentDir, getPathObject, resolvePath, canRead, permissionToString
} from '../terminalUtils.js';
import { getCurrentUser } from '../userManagement.js';
import { expandVariables } from '../variableExpansion.js';
import { validateArgs, hasFlag } from '../argumentValidator.js';

// Helper function for recursive listing
function listRecursive(dirObj, path, showLongFormat, currentUser, indent = '') {
    let output = [];

    if (!canRead(dirObj, currentUser)) {
        return [`${indent}ls: cannot open directory '${path}': Permission denied`];
    }

    const items = Object.keys(dirObj.children || {});

    if (showLongFormat) {
        items.forEach(item => {
            const obj = dirObj.children[item];
            const permString = permissionToString(obj.permissions || (obj.type === 'directory' ? 0o755 : 0o644));
            const typeChar = obj.type === 'directory' ? 'd' : '-';
            const size = obj.size !== undefined ? obj.size : (obj.type === 'directory' ? 4096 : 0);
            const date = obj.date || getCurrentDateFormatted();
            const owner = obj.owner || defaultOwner;
            const group = obj.group || defaultGroup;
            const name = obj.type === 'directory' ? `\x1B[1;34m${item}\x1B[0m` : item;
            output.push(`${indent}${typeChar}${permString} 1 ${owner} ${group} ${size.toString().padStart(6)} ${date} ${name}`);
        });
    } else {
        output.push(indent + items.map(item => {
            const obj = dirObj.children[item];
            return obj.type === 'directory' ? `\x1B[1;34m${item}/\x1B[0m` : item;
        }).join('\t'));
    }

    // Recursively list subdirectories
    items.forEach(item => {
        const obj = dirObj.children[item];
        if (obj.type === 'directory') {
            const newPath = path === '/' ? `/${item}` : `${path}/${item}`;
            output.push(''); // Empty line before subdirectory
            output.push(`${indent}${newPath}:`);
            output.push(...listRecursive(obj, newPath, showLongFormat, currentUser, indent));
        }
    });

    return output;
}

export const lsCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('ls', args);
    if (!validation.valid) {
        return validation.error;
    }

    const { flags, nonFlags } = validation;

    let lsTarget = nonFlags[0];
    let targetObjForLs = getCurrentDir();
    let showLongFormat = hasFlag(flags, 'l');
    let showRecursive = hasFlag(flags, 'R');
    let showAll = hasFlag(flags, 'a') || hasFlag(flags, 'A');
    let showDirectory = hasFlag(flags, 'd');  // -d flag: list directory itself, not contents
    let output = '';
    const currentUser = getCurrentUser();

    if (lsTarget) {
        // Expand variables in path
        lsTarget = expandVariables(lsTarget);
        const resolvedPath = resolvePath(lsTarget);
        targetObjForLs = getPathObject(resolvedPath);
    }

    if (!targetObjForLs) {
        output = `ls: cannot access '${lsTarget}': No such file or directory`;
    } else if (targetObjForLs.type === 'file') {
        const fileName = lsTarget || Object.keys(getCurrentDir().children).find(key => getCurrentDir().children[key] === targetObjForLs);
        if (showLongFormat) {
            const permString = permissionToString(targetObjForLs.permissions || 0o644);
            const size = targetObjForLs.size !== undefined ? targetObjForLs.size : 0;
            const date = targetObjForLs.date || getCurrentDateFormatted();
            const owner = targetObjForLs.owner || defaultOwner;
            const group = targetObjForLs.group || defaultGroup;
            output = `-${permString} 1 ${owner} ${group} ${size.toString().padStart(6)} ${date} ${fileName}`;
        } else {
            output = fileName;
        }
    } else if (targetObjForLs.type === 'directory' && showDirectory) {
        // With -d flag, show directory info itself, not contents
        const dirName = lsTarget || '.';
        if (showLongFormat) {
            const permString = permissionToString(targetObjForLs.permissions || 0o755);
            const size = targetObjForLs.size !== undefined ? targetObjForLs.size : 4096;
            const date = targetObjForLs.date || getCurrentDateFormatted();
            const owner = targetObjForLs.owner || defaultOwner;
            const group = targetObjForLs.group || defaultGroup;
            output = `d${permString} 1 ${owner} ${group} ${size.toString().padStart(6)} ${date} \x1B[1;34m${dirName}\x1B[0m`;
        } else {
            output = `\x1B[1;34m${dirName}/\x1B[0m`;
        }
    } else if (targetObjForLs.type === 'directory') {
        // Check read permission on directory
        if (!canRead(targetObjForLs, currentUser)) {
            output = `ls: cannot open directory '${lsTarget || '.'}': Permission denied`;
        } else {
            const items = Object.keys(targetObjForLs.children || {});
            if (items.length === 0) {
                output = '';
            } else {
                if (showRecursive) {
                    // Recursive listing
                    const path = lsTarget || currentPath;
                    const lines = listRecursive(targetObjForLs, path, showLongFormat, currentUser);
                    output = lines.join('\r\n');
                } else if (showLongFormat) {
                    output = items.map(item => {
                        const obj = targetObjForLs.children[item];
                        const permString = permissionToString(obj.permissions || (obj.type === 'directory' ? 0o755 : 0o644));
                        const typeChar = obj.type === 'directory' ? 'd' : '-';
                        const size = obj.size !== undefined ? obj.size : (obj.type === 'directory' ? 4096 : 0);
                        const date = obj.date || getCurrentDateFormatted();
                        const owner = obj.owner || defaultOwner;
                        const group = obj.group || defaultGroup;
                        const name = obj.type === 'directory' ? `\x1B[1;34m${item}\x1B[0m` : item;
                        return `${typeChar}${permString} 1 ${owner} ${group} ${size.toString().padStart(6)} ${date} ${name}`;
                    }).join('\r\n');
                } else {
                    output = items.map(item => {
                        const obj = targetObjForLs.children[item];
                        return obj.type === 'directory' ? `\x1B[1;34m${item}/\x1B[0m` : item;
                    }).join('\t');
                }
            }
        }
    } else {
        output = `ls: cannot access '${lsTarget}': Not a directory`;
    }
    return output;
};
