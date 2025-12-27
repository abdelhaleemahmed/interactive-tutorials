// js/commands/whereis.js

import { getPathObject, resolvePath } from '../terminalUtils.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * whereis command - Locate binary, source, and manual pages
 * Usage: whereis [-b] [-m] [-s] <command> [command2 ...]
 *
 * Searches standard locations for binaries, man pages, and source files
 * -b: Search only for binaries
 * -m: Search only for manual pages
 * -s: Search only for source files
 */
export const whereisCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('whereis', args);
    if (!validation.valid) {
        return validation.error;
    }

    if (args.length === 0) {
        return 'whereis: missing argument\nUsage: whereis [-b] [-m] [-s] <command> [command2 ...]';
    }

    // Parse flags
    let searchBinaries = true;
    let searchManPages = true;
    let searchSource = true;
    const commands = [];

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-b') {
            searchBinaries = true;
            searchManPages = false;
            searchSource = false;
        } else if (args[i] === '-m') {
            searchBinaries = false;
            searchManPages = true;
            searchSource = false;
        } else if (args[i] === '-s') {
            searchBinaries = false;
            searchManPages = false;
            searchSource = true;
        } else if (!args[i].startsWith('-')) {
            commands.push(args[i]);
        }
    }

    if (commands.length === 0) {
        return 'whereis: no commands specified';
    }

    // Standard search locations
    const binaryPaths = ['/bin', '/usr/bin', '/usr/local/bin', '/sbin', '/usr/sbin'];
    const manPaths = ['/usr/share/man/man1', '/usr/share/man/man8', '/usr/local/share/man'];
    const sourcePaths = ['/usr/src', '/usr/local/src'];

    // Built-in commands (always available in /usr/bin)
    const builtinCommands = [
        'ls', 'cd', 'pwd', 'cat', 'echo', 'mkdir', 'rmdir', 'touch',
        'rm', 'mv', 'cp', 'chmod', 'chown', 'grep', 'find', 'head',
        'tail', 'sort', 'uniq', 'wc', 'su', 'whoami', 'date', 'clear',
        'help', 'sleep', 'jobs', 'fg', 'bg', 'ps', 'kill',
        'export', 'env', 'umask', 'stat', 'locate', 'which', 'whereis'
    ];

    const results = [];

    for (const cmd of commands) {
        const locations = [];

        // Search for binaries
        if (searchBinaries) {
            // Check if it's a built-in command
            if (builtinCommands.includes(cmd)) {
                locations.push('/usr/bin/' + cmd);
            } else {
                // Search in binary paths
                for (const binPath of binaryPaths) {
                    const fullPath = binPath + '/' + cmd;
                    const resolved = resolvePath(fullPath);
                    const fileObj = getPathObject(resolved);

                    if (fileObj && fileObj.type === 'file') {
                        locations.push(fullPath);
                    }
                }
            }
        }

        // Search for man pages
        if (searchManPages) {
            for (const manPath of manPaths) {
                const manFile = manPath + '/' + cmd + '.1';  // Section 1 (user commands)
                const resolved = resolvePath(manFile);
                const fileObj = getPathObject(resolved);

                if (fileObj && fileObj.type === 'file') {
                    locations.push(manFile);
                }

                // Also check section 8 (system admin commands)
                const manFile8 = manPath.replace('man1', 'man8') + '/' + cmd + '.8';
                const resolved8 = resolvePath(manFile8);
                const fileObj8 = getPathObject(resolved8);

                if (fileObj8 && fileObj8.type === 'file') {
                    locations.push(manFile8);
                }
            }
        }

        // Search for source files
        if (searchSource) {
            for (const srcPath of sourcePaths) {
                const srcFile = srcPath + '/' + cmd;
                const resolved = resolvePath(srcFile);
                const fileObj = getPathObject(resolved);

                if (fileObj) {
                    locations.push(srcFile);
                }
            }
        }

        // Format output: command: path1 path2 path3
        if (locations.length > 0) {
            results.push(`${cmd}: ${locations.join(' ')}`);
        } else {
            // Some versions of whereis still show the command name even if nothing found
            results.push(`${cmd}:`);
        }
    }

    return results.join('\n');
};
