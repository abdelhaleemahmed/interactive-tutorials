// js/commands/echo.js

import { expandVariables } from '../variableExpansion.js';
import { validateArgs } from '../argumentValidator.js';

export const echoCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('echo', args);
    if (!validation.valid) {
        return validation.error;
    }

    const { nonFlags } = validation;

    // If no arguments, return empty line
    if (nonFlags.length === 0) {
        return '';
    }

    // Expand variables in each argument
    const expandedArgs = nonFlags.map(arg => expandVariables(arg));

    // Join all arguments with spaces and return
    return expandedArgs.join(' ');
};
