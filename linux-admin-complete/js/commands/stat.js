// js/commands/stat.js

import { getPathObject, resolvePath, permissionToString, getCurrentDateFormatted, getCurrentDir } from '../terminalUtils.js';
import { expandVariables } from '../variableExpansion.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * stat command - Display detailed file information
 * Usage: stat <file>
 *
 * Shows size, permissions, owner, group, and timestamps
 */
export const statCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('stat', args);
    if (!validation.valid) {
        return validation.error;
    }

    if (!args[0]) {
        return 'stat: missing operand\nTry \'stat --help\' for more information.';
    }

    // Expand variables in file path
    let fileName = expandVariables(args[0]);
    const originalName = args[0];

    const resolved = resolvePath(fileName);
    const fileObj = getPathObject(resolved);

    if (!fileObj) {
        return `stat: cannot stat '${originalName}': No such file or directory`;
    }

    // Extract file information
    const perms = fileObj.permissions || 0o644;
    const permString = permissionToString(perms);
    const size = fileObj.size || (fileObj.type === 'directory' ? 4096 : 0);
    const owner = fileObj.owner || 'user';
    const group = fileObj.group || 'user';
    const type = fileObj.type === 'directory' ? 'directory' : 'regular file';

    // Build full path
    const currentDir = getCurrentDir();
    let fullPath;
    if (fileName.startsWith('/')) {
        fullPath = fileName;
    } else {
        fullPath = currentDir + '/' + fileName;
    }

    // Format permissions as 4-digit octal
    const permOctal = perms.toString(8).padStart(4, '0');

    // Get timestamps
    const accessTime = fileObj.accessTime || getCurrentDateFormatted();
    const modifyTime = fileObj.modifyTime || getCurrentDateFormatted();
    const changeTime = fileObj.changeTime || getCurrentDateFormatted();

    // Build output
    let output = '';
    output += `  File: ${fullPath}\n`;
    output += `  Size: ${size.toString().padEnd(16)}Blocks: 8          IO Block: 4096   ${type}\n`;
    output += `Device: /dev/sda1       Inode: 12345       Links: 1\n`;
    output += `Access: (${permOctal}/${permString})  `;
    output += `Uid: (1000/${owner.padEnd(7)})   Gid: (1000/${group.padEnd(7)})\n`;
    output += `Access: ${accessTime}\n`;
    output += `Modify: ${modifyTime}\n`;
    output += `Change: ${changeTime}\n`;
    output += ` Birth: -`;

    return output;
};
