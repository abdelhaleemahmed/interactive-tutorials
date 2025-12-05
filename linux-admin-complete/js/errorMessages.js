// js/errorMessages.js
// Utility functions for better error messages

import { getCurrentDir } from './terminalUtils.js';

/**
 * Find similar file/directory names for suggestions
 */
export const findSimilarNames = (targetName, directory = null) => {
    const dir = directory || getCurrentDir();
    if (!dir || !dir.children) return [];

    const names = Object.keys(dir.children);
    const similar = [];

    // Simple similarity check: starts with same letter or is close in length
    names.forEach(name => {
        const targetLower = targetName.toLowerCase();
        const nameLower = name.toLowerCase();

        // Exact case-insensitive match
        if (nameLower === targetLower && name !== targetName) {
            similar.push(name);
        }
        // Starts with same letters
        else if (nameLower.startsWith(targetLower.substring(0, 2))) {
            similar.push(name);
        }
    });

    return similar.slice(0, 3); // Return top 3 suggestions
};

/**
 * Format "no such file or directory" error with suggestions
 */
export const noSuchFileError = (fileName) => {
    const suggestions = findSimilarNames(fileName);
    let error = `bash: ${fileName}: No such file or directory`;

    if (suggestions.length > 0) {
        error += `\r\nDid you mean one of these?`;
        suggestions.forEach(name => {
            error += `\r\n  ${name}`;
        });
    }

    return error;
};

/**
 * Format missing argument error with usage hint
 */
export const missingArgumentError = (command, argName) => {
    const usageHints = {
        'cd': 'Usage: cd <directory>',
        'cat': 'Usage: cat <file>',
        'mkdir': 'Usage: mkdir <directory>',
        'rmdir': 'Usage: rmdir <directory>',
        'touch': 'Usage: touch <file>',
        'rm': 'Usage: rm <file>',
        'mv': 'Usage: mv <source> <destination>',
        'cp': 'Usage: cp <source> <destination>'
    };

    let error = `bash: ${command}: missing ${argName}`;
    const hint = usageHints[command];
    if (hint) {
        error += `\r\n${hint}`;
    }

    return error;
};

/**
 * Format "not a directory" error
 */
export const notADirectoryError = (fileName) => {
    return `bash: cd: ${fileName}: Not a directory`;
};

/**
 * Format "is a directory" error for rm command
 */
export const isADirectoryError = (fileName) => {
    return `bash: rm: ${fileName}: Is a directory (use 'rmdir' instead)`;
};

/**
 * Format "directory not empty" error
 */
export const directoryNotEmptyError = (dirName) => {
    return `bash: rmdir: ${dirName}: Directory not empty`;
};

/**
 * Format permission denied error
 */
export const permissionDeniedError = (command, target) => {
    return `bash: ${command}: permission denied: ${target}`;
};
