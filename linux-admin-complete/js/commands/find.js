// js/commands/find.js

import { getPathObject, resolvePath, canRead, canExecute } from '../terminalUtils.js';
import { getCurrentUser } from '../userManagement.js';
import { expandVariables } from '../variableExpansion.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * Match a string against a wildcard pattern
 * Supports * (any characters) and ? (single character)
 */
function matchPattern(str, pattern) {
    // Remove quotes if present
    pattern = pattern.replace(/^["']|["']$/g, '');

    // Convert wildcard pattern to regex
    const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(str);
}

/**
 * Check if file matches all specified filters
 */
function matchesFilters(fileObj, fileName, fullPath, filters) {
    // Type filter
    if (filters.type === 'f' && fileObj.type !== 'file') return false;
    if (filters.type === 'd' && fileObj.type !== 'directory') return false;

    // Name filter (pattern matching)
    if (filters.name && !matchPattern(fileName, filters.name)) return false;

    // Size filter
    if (filters.size) {
        const size = fileObj.size || 0;
        if (filters.size.op === '+' && size <= filters.size.value) return false;
        if (filters.size.op === '-' && size >= filters.size.value) return false;
    }

    // Permission filter
    if (filters.perm !== null) {
        const filePerm = (fileObj.permissions || 0o644) & 0o777;  // Mask to regular perms
        if (filePerm !== filters.perm) return false;
    }

    // User filter
    if (filters.user && fileObj.owner !== filters.user) return false;

    // Empty filter
    if (filters.empty) {
        if (fileObj.type === 'file') {
            const content = fileObj.content || '';
            if (content.length > 0) return false;
        } else if (fileObj.type === 'directory') {
            const children = fileObj.children || {};
            if (Object.keys(children).length > 0) return false;
        }
    }

    return true;
}

/**
 * find command - Search for files matching criteria
 * Usage: find <path> [-type f|d] [-name pattern] [-size +N|-N] [-perm mode] [-user username] [-empty]
 */
export const findCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('find', args);
    if (!validation.valid) {
        return validation.error;
    }

    const currentUser = getCurrentUser();

    // Parse arguments
    let searchPath = '.';
    const filters = {
        type: null,      // 'f' or 'd'
        name: null,      // pattern string
        size: null,      // {op: '+' or '-', value: number}
        perm: null,      // octal permissions
        user: null,      // username
        empty: false     // boolean
    };

    // First non-flag argument is the path
    let i = 0;
    if (args[0] && !args[0].startsWith('-')) {
        searchPath = expandVariables(args[0]);
        i = 1;
    }

    // Parse flags
    while (i < args.length) {
        const arg = args[i];

        if (arg === '-type') {
            if (i + 1 >= args.length) {
                return 'find: -type requires an argument';
            }
            filters.type = args[i + 1];
            if (filters.type !== 'f' && filters.type !== 'd') {
                return `find: -type: invalid argument '${filters.type}'`;
            }
            i += 2;
        } else if (arg === '-name') {
            if (i + 1 >= args.length) {
                return 'find: -name requires an argument';
            }
            filters.name = args[i + 1];
            i += 2;
        } else if (arg === '-size') {
            if (i + 1 >= args.length) {
                return 'find: -size requires an argument';
            }
            const sizeArg = args[i + 1];
            if (sizeArg.startsWith('+')) {
                filters.size = {op: '+', value: parseInt(sizeArg.substring(1))};
            } else if (sizeArg.startsWith('-')) {
                filters.size = {op: '-', value: parseInt(sizeArg.substring(1))};
            } else {
                return `find: -size: invalid argument '${sizeArg}'`;
            }
            if (isNaN(filters.size.value)) {
                return `find: -size: invalid number '${sizeArg}'`;
            }
            i += 2;
        } else if (arg === '-perm') {
            if (i + 1 >= args.length) {
                return 'find: -perm requires an argument';
            }
            filters.perm = parseInt(args[i + 1], 8);
            if (isNaN(filters.perm)) {
                return `find: -perm: invalid mode '${args[i + 1]}'`;
            }
            i += 2;
        } else if (arg === '-user') {
            if (i + 1 >= args.length) {
                return 'find: -user requires an argument';
            }
            filters.user = args[i + 1];
            i += 2;
        } else if (arg === '-empty') {
            filters.empty = true;
            i++;
        } else {
            return `find: unknown option '${arg}'`;
        }
    }

    // Resolve search path
    const resolved = resolvePath(searchPath);
    const pathObj = getPathObject(resolved);

    if (!pathObj) {
        return `find: '${searchPath}': No such file or directory`;
    }

    if (pathObj.type === 'file') {
        return `find: '${searchPath}': Not a directory`;
    }

    // Check permission to read directory
    if (!canRead(pathObj, currentUser)) {
        return `find: '${searchPath}': Permission denied`;
    }

    // Search recursively
    const matches = [];

    function searchRecursive(dir, currentPath) {
        if (!dir.children) return;

        for (const name in dir.children) {
            const item = dir.children[name];
            const fullPath = currentPath ? `${currentPath}/${name}` : name;

            // Check if matches all filters
            if (matchesFilters(item, name, fullPath, filters)) {
                matches.push(fullPath);
            }

            // Recurse into directories (if we have execute permission)
            if (item.type === 'directory' && canExecute(item, currentUser)) {
                searchRecursive(item, fullPath);
            }
        }
    }

    searchRecursive(pathObj, searchPath === '.' ? '.' : '');

    if (matches.length === 0) {
        return '';  // No matches - no output
    }

    return matches.join('\n');
};
