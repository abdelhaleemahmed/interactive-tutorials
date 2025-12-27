// js/variableExpansion.js
// Variable expansion and substitution

import { getEnvironmentVariable } from './environmentVariables.js';

/**
 * Expand environment variables in a string
 * Supports both $VAR and ${VAR} syntax
 *
 * @param {string} str - String to expand
 * @returns {string} String with variables expanded
 */
export function expandVariables(str) {
    if (!str || typeof str !== 'string') {
        return str;
    }

    let result = str;
    let changed = true;
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops

    // Keep expanding until no more changes or max iterations
    while (changed && iterations < maxIterations) {
        const before = result;

        // Expand ${VAR} syntax (braced variables)
        result = result.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (match, varName) => {
            return getEnvironmentVariable(varName);
        });

        // Expand $VAR syntax (unbraced variables)
        // Match $VAR but not \$VAR (escaped)
        result = result.replace(/(?<!\\)\$([A-Za-z_][A-Za-z0-9_]*)/g, (match, varName) => {
            return getEnvironmentVariable(varName);
        });

        changed = (before !== result);
        iterations++;
    }

    // Handle escaped dollar signs (\$VAR should become $VAR)
    result = result.replace(/\\\$/g, '$');

    return result;
}

/**
 * Expand variables in an array of strings
 * @param {string[]} args - Array of strings to expand
 * @returns {string[]} Array with variables expanded
 */
export function expandVariablesInArray(args) {
    if (!Array.isArray(args)) {
        return args;
    }

    return args.map(arg => expandVariables(arg));
}

/**
 * Check if a string contains variable references
 * @param {string} str - String to check
 * @returns {boolean} True if string contains variables
 */
export function containsVariables(str) {
    if (!str || typeof str !== 'string') {
        return false;
    }

    // Check for $VAR or ${VAR} (but not \$VAR)
    return /(?<!\\)\$(\{[A-Za-z_][A-Za-z0-9_]*\}|[A-Za-z_][A-Za-z0-9_]*)/.test(str);
}

/**
 * Extract variable names from a string
 * @param {string} str - String to analyze
 * @returns {string[]} Array of variable names found
 */
export function extractVariableNames(str) {
    if (!str || typeof str !== 'string') {
        return [];
    }

    const names = new Set();

    // Find ${VAR} syntax
    const bracedMatches = str.matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g);
    for (const match of bracedMatches) {
        names.add(match[1]);
    }

    // Find $VAR syntax (not escaped)
    const unbracedMatches = str.matchAll(/(?<!\\)\$([A-Za-z_][A-Za-z0-9_]*)/g);
    for (const match of unbracedMatches) {
        names.add(match[1]);
    }

    return Array.from(names);
}
