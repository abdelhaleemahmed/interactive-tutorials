// js/commands/export.js

import {
    getAllEnvironmentVariables,
    setEnvironmentVariable,
    isValidVariableName,
    parseAssignment
} from '../environmentVariables.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * export command - Set or display environment variables
 * Usage: export [VARIABLE=value ...]
 *
 * Without arguments: displays all environment variables
 * With arguments: sets one or more environment variables
 */
export const exportCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('export', args);
    if (!validation.valid) {
        return validation.error;
    }

    // No arguments - display all environment variables
    if (args.length === 0) {
        const vars = getAllEnvironmentVariables();
        const sortedKeys = Object.keys(vars).sort();

        if (sortedKeys.length === 0) {
            return '';
        }

        return sortedKeys.map(key => {
            const value = vars[key];
            // Quote values that contain spaces or special characters
            if (value.includes(' ') || value.includes('$') || value.includes('"')) {
                return `declare -x ${key}="${value}"`;
            }
            return `declare -x ${key}="${value}"`;
        }).join('\n');
    }

    // Process variable assignments
    const errors = [];
    const successes = [];

    for (const arg of args) {
        const parsed = parseAssignment(arg);

        if (!parsed) {
            errors.push(`export: '${arg}': not a valid assignment`);
            continue;
        }

        const { name, value } = parsed;

        // Validate variable name
        if (!isValidVariableName(name)) {
            errors.push(`export: '${name}': not a valid identifier`);
            continue;
        }

        // Set the variable
        setEnvironmentVariable(name, value);
        successes.push(name);
    }

    // Return errors if any
    if (errors.length > 0) {
        return errors.join('\n');
    }

    // Success - no output (like real bash)
    return '';
};
