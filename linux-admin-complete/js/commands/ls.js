
// js/commands/ls.js

import {
    fileSystem, currentPath, user, hostname,
    defaultDirPermissions, defaultFilePermissions, defaultOwner, defaultGroup,
    getCurrentDateFormatted, getCurrentDir, getPathObject, resolvePath, canRead, permissionToString
} from '../terminalUtils.js';
import { getCurrentUser } from '../userManagement.js';

export const lsCommand = (args) => {
    let lsTarget = args[0];
    let targetObjForLs = getCurrentDir();
    let showLongFormat = false;
    let output = '';
    const currentUser = getCurrentUser();

    if (args.includes('-l')) {
        showLongFormat = true;
        const filteredArgs = args.filter(arg => arg !== '-l');
        if (filteredArgs.length > 0) {
            lsTarget = filteredArgs[0];
        } else {
            lsTarget = undefined;
        }
    }

    if (lsTarget) {
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
    } else if (targetObjForLs.type === 'directory') {
        // Check read permission on directory
        if (!canRead(targetObjForLs, currentUser)) {
            output = `ls: cannot open directory '${lsTarget || '.'}': Permission denied`;
        } else {
            const items = Object.keys(targetObjForLs.children || {});
            if (items.length === 0) {
                output = '';
            } else {
                if (showLongFormat) {
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
