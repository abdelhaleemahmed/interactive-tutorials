// js/commands/which.js

import { getEnvironmentVariable } from '../environmentVariables.js';
import { getPathObject, resolvePath } from '../terminalUtils.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * which command - Locate a command in PATH
 * Usage: which <command> [command2 ...]
 *
 * Shows the full path of executable commands by searching PATH
 */
export const whichCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('which', args);
    if (!validation.valid) {
        return validation.error;
    }

    if (args.length === 0) {
        return '';  // No output for no args (like real which)
    }

    const pathEnv = getEnvironmentVariable('PATH');
    const pathDirs = pathEnv.split(':').filter(p => p);

    const results = [];

    // Built-in commands (always available)
    const builtinCommands = [
        'ls', 'cd', 'pwd', 'cat', 'echo', 'mkdir', 'rmdir', 'touch',
        'rm', 'mv', 'cp', 'chmod', 'chown', 'grep', 'find', 'head',
        'tail', 'sort', 'uniq', 'wc', 'su', 'whoami', 'date', 'clear',
        'help', 'sleep', 'jobs', 'fg', 'bg', 'ps', 'kill',
        'export', 'env', 'umask', 'stat', 'locate', 'which', 'whereis'
    ];

    for (const cmd of args) {
        let found = false;

        // Check if it's a built-in command
        if (builtinCommands.includes(cmd)) {
            results.push(`/usr/bin/${cmd}`);
            continue;
        }

        // Search through PATH directories
        for (const dir of pathDirs) {
            const fullPath = dir + '/' + cmd;
            const resolved = resolvePath(fullPath);
            const fileObj = getPathObject(resolved);

            if (fileObj && fileObj.type === 'file') {
                results.push(fullPath);
                found = true;
                break;  // Return first match only
            }
        }

        // which outputs nothing for commands not found
    }

    return results.join('\n');
};
