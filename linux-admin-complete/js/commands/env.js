// js/commands/env.js

import {
    getAllEnvironmentVariables,
    unsetEnvironmentVariable
} from '../environmentVariables.js';

/**
 * env command - Display or modify environment variables
 * Usage: env [-u VARIABLE]
 *
 * Without arguments: displays all environment variables
 * With -u: unsets the specified variable
 */
export const envCommand = (args) => {
    // Handle -u flag (unset variable)
    if (args.length >= 2 && args[0] === '-u') {
        const varName = args[1];
        unsetEnvironmentVariable(varName);
        return '';
    }

    // Display all environment variables
    const vars = getAllEnvironmentVariables();
    const sortedKeys = Object.keys(vars).sort();

    if (sortedKeys.length === 0) {
        return '';
    }

    return sortedKeys.map(key => `${key}=${vars[key]}`).join('\n');
};
