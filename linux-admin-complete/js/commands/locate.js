// js/commands/locate.js

import { fileSystem } from '../terminalUtils.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * locate command - Fast search for files by name
 * Usage: locate [-i] [-b] <pattern>
 *
 * Searches the entire filesystem for files matching a pattern
 * -i: Case-insensitive (default)
 * -b: Match basename only
 */
export const locateCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('locate', args);
    if (!validation.valid) {
        return validation.error;
    }

    if (args.length === 0) {
        return 'locate: no pattern specified';
    }

    let caseInsensitive = true;  // Default
    let basenameOnly = false;
    let pattern = args[args.length - 1];

    // Parse flags
    for (let i = 0; i < args.length - 1; i++) {
        if (args[i] === '-i') {
            caseInsensitive = true;
        } else if (args[i] === '-b') {
            basenameOnly = true;
        }
    }

    // Convert pattern to lowercase if case-insensitive
    const searchPattern = caseInsensitive ? pattern.toLowerCase() : pattern;

    // Search entire filesystem
    const results = [];

    function searchRecursive(obj, currentPath) {
        if (!obj || !obj.children) return;

        for (const name in obj.children) {
            const child = obj.children[name];
            const fullPath = currentPath + '/' + name;

            // Match against full path or basename
            const matchTarget = basenameOnly ? name : fullPath;
            const matchString = caseInsensitive ? matchTarget.toLowerCase() : matchTarget;

            if (matchString.includes(searchPattern)) {
                results.push(fullPath);
            }

            // Recurse into directories
            if (child.type === 'directory') {
                searchRecursive(child, fullPath);
            }
        }
    }

    searchRecursive(fileSystem, '');

    if (results.length === 0) {
        return '';  // No output for no matches
    }

    return results.join('\n');
};
