// js/environmentVariables.js
// Environment variable management system

import { getCurrentUser } from './userManagement.js';
import { getCurrentDir } from './terminalUtils.js';

// Environment variable storage
let environmentVariables = {};

/**
 * Initialize environment with default variables
 */
export function initializeEnvironment() {
    const user = getCurrentUser();
    const currentDir = getCurrentDir();

    environmentVariables = {
        'HOME': user.home,
        'USER': user.username,
        'PWD': currentDir,
        'PATH': '/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin',
        'SHELL': '/bin/bash',
        'TERM': 'xterm-256color',
        'LANG': 'en_US.UTF-8',
        'HOSTNAME': 'localhost',
        'LOGNAME': user.username,
        'OLDPWD': user.home
    };
}

/**
 * Get an environment variable
 * @param {string} name - Variable name
 * @returns {string} Variable value or empty string if not found
 */
export function getEnvironmentVariable(name) {
    return environmentVariables[name] || '';
}

/**
 * Set an environment variable
 * @param {string} name - Variable name
 * @param {string} value - Variable value
 */
export function setEnvironmentVariable(name, value) {
    environmentVariables[name] = value;
}

/**
 * Unset an environment variable
 * @param {string} name - Variable name
 */
export function unsetEnvironmentVariable(name) {
    delete environmentVariables[name];
}

/**
 * Get all environment variables
 * @returns {Object} All environment variables
 */
export function getAllEnvironmentVariables() {
    return { ...environmentVariables };
}

/**
 * Check if a variable name is valid
 * Variable names must:
 * - Start with a letter or underscore
 * - Contain only letters, numbers, and underscores
 *
 * @param {string} name - Variable name to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidVariableName(name) {
    if (!name || typeof name !== 'string') {
        return false;
    }

    // Must start with letter or underscore, then letters, numbers, or underscores
    const validNamePattern = /^[A-Za-z_][A-Za-z0-9_]*$/;
    return validNamePattern.test(name);
}

/**
 * Parse a variable assignment string (VARIABLE=value)
 * @param {string} assignment - Assignment string
 * @returns {Object|null} Object with {name, value} or null if invalid
 */
export function parseAssignment(assignment) {
    if (!assignment || typeof assignment !== 'string') {
        return null;
    }

    const equalIndex = assignment.indexOf('=');
    if (equalIndex === -1) {
        return null;
    }

    const name = assignment.substring(0, equalIndex);
    let value = assignment.substring(equalIndex + 1);

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
    }

    return { name, value };
}

/**
 * Update PWD variable (called by cd command)
 * @param {string} newPath - New working directory path
 */
export function updatePWD(newPath) {
    // Save old PWD to OLDPWD
    if (environmentVariables['PWD']) {
        environmentVariables['OLDPWD'] = environmentVariables['PWD'];
    }
    environmentVariables['PWD'] = newPath;
}

/**
 * Update USER variable (called when switching users)
 * @param {string} username - New username
 * @param {string} home - New home directory
 */
export function updateUser(username, home) {
    environmentVariables['USER'] = username;
    environmentVariables['LOGNAME'] = username;
    environmentVariables['HOME'] = home;
}

// Initialize environment on module load
initializeEnvironment();
