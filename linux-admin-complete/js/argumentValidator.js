// js/argumentValidator.js
// Centralized argument validation for all terminal commands
//
// This module provides a unified validation system for command-line arguments
// to ensure that commands reject invalid flags and enforce argument count constraints.
//
// Usage Example:
//   import { validateArgs, hasFlag } from './argumentValidator.js';
//
//   export const lsCommand = (args) => {
//       const validation = validateArgs('ls', args);
//       if (!validation.valid) {
//           return validation.error;
//       }
//       const { flags, nonFlags } = validation;
//       const showLongFormat = hasFlag(flags, 'l');
//       // ... rest of command logic
//   };

/**
 * Command specifications defining valid flags and argument constraints.
 *
 * Each command spec includes:
 * - validFlags: Array of single-character flags that are valid for this command
 * - minArgs: (Optional) Minimum number of non-flag arguments required
 * - maxArgs: (Optional) Maximum number of non-flag arguments allowed
 * - description: Brief description of what the command does
 * - usage: Usage string shown in error messages
 *
 * @type {Object.<string, {validFlags: string[], minArgs?: number, maxArgs?: number, description: string, usage: string}>}
 */
export const commandSpecs = {
    ls: {
        validFlags: ['l', 'a', 'R', 'h', 't', 'r', '1', 'A', 'd'],
        description: 'list directory contents',
        usage: 'ls [OPTION]... [FILE]...'
    },
    cd: {
        validFlags: ['L', 'P'],
        maxArgs: 1,
        description: 'change directory',
        usage: 'cd [DIRECTORY]'
    },
    pwd: {
        validFlags: ['L', 'P'],
        maxArgs: 0,
        description: 'print working directory',
        usage: 'pwd'
    },
    mkdir: {
        validFlags: ['p', 'm', 'v'],
        minArgs: 1,
        description: 'make directories',
        usage: 'mkdir [OPTION]... DIRECTORY...'
    },
    rm: {
        validFlags: ['r', 'f', 'i', 'v', 'd', 'R'],
        minArgs: 1,
        description: 'remove files or directories',
        usage: 'rm [OPTION]... FILE...'
    },
    rmdir: {
        validFlags: ['p', 'v'],
        minArgs: 1,
        description: 'remove empty directories',
        usage: 'rmdir [OPTION]... DIRECTORY...'
    },
    cp: {
        validFlags: ['r', 'R', 'f', 'i', 'v', 'p', 'a'],
        minArgs: 2,
        description: 'copy files and directories',
        usage: 'cp [OPTION]... SOURCE DEST'
    },
    mv: {
        validFlags: ['f', 'i', 'v', 'n'],
        minArgs: 2,
        description: 'move (rename) files',
        usage: 'mv [OPTION]... SOURCE DEST'
    },
    touch: {
        validFlags: ['a', 'm', 'c', 't', 'd', 'r'],
        minArgs: 1,
        description: 'change file timestamps',
        usage: 'touch [OPTION]... FILE...'
    },
    cat: {
        validFlags: ['n', 'b', 'E', 'T', 'v', 'A'],
        minArgs: 1,
        description: 'concatenate files and print',
        usage: 'cat [OPTION]... [FILE]...'
    },
    chmod: {
        validFlags: ['R', 'v', 'c'],
        minArgs: 2,
        description: 'change file mode bits',
        usage: 'chmod [OPTION]... MODE FILE...'
    },
    chown: {
        validFlags: ['R', 'v', 'c', 'h'],
        minArgs: 2,
        description: 'change file owner and group',
        usage: 'chown [OPTION]... OWNER[:GROUP] FILE...'
    },
    echo: {
        validFlags: ['n', 'e', 'E'],
        description: 'display a line of text',
        usage: 'echo [OPTION]... [STRING]...'
    },
    ps: {
        validFlags: ['a', 'u', 'x', 'e', 'f'],
        maxArgs: 0,
        description: 'report process status',
        usage: 'ps [OPTION]...'
    },
    kill: {
        validFlags: ['s', 'l', '9', '15', 'KILL', 'TERM'],
        minArgs: 1,
        description: 'terminate a process',
        usage: 'kill [OPTION]... PID...'
    },
    grep: {
        validFlags: ['i', 'v', 'r', 'n', 'l', 'c', 'w', 'E'],
        minArgs: 1,
        description: 'print lines matching a pattern',
        usage: 'grep [OPTION]... PATTERN [FILE]...'
    },
    find: {
        validFlags: [],
        minArgs: 1,
        description: 'search for files',
        usage: 'find [PATH]... [EXPRESSION]'
    },
    head: {
        validFlags: ['n', 'c', 'q', 'v'],
        minArgs: 1,
        description: 'output the first part of files',
        usage: 'head [OPTION]... [FILE]...'
    },
    tail: {
        validFlags: ['n', 'c', 'f', 'q', 'v'],
        minArgs: 1,
        description: 'output the last part of files',
        usage: 'tail [OPTION]... [FILE]...'
    },
    id: {
        validFlags: ['u', 'g', 'G', 'n', 'r'],
        maxArgs: 1,
        description: 'print user and group information',
        usage: 'id [OPTION]... [USER]'
    },
    groups: {
        validFlags: [],
        maxArgs: 1,
        description: 'print group memberships',
        usage: 'groups [USER]'
    },
    sudo: {
        validFlags: [],
        minArgs: 1,
        description: 'execute a command as root',
        usage: 'sudo <command> [arguments]'
    },
    groupadd: {
        validFlags: ['f', 'g', 'r', 'o'],
        minArgs: 1,
        maxArgs: 1,
        description: 'create a new group',
        usage: 'groupadd [OPTION]... GROUP'
    },
    useradd: {
        validFlags: ['m', 'g', 's', 'd', 'u', 'c', 'r'],
        minArgs: 1,
        maxArgs: 1,
        description: 'create a new user',
        usage: 'useradd [OPTION]... USERNAME'
    },
    usermod: {
        validFlags: ['a', 'G', 'g', 'L', 'U', 'd', 's', 'c'],
        minArgs: 1,
        description: 'modify a user account',
        usage: 'usermod [OPTION]... LOGIN'
    }
};

/**
 * Validates command arguments against the command specification.
 *
 * This function checks:
 * 1. All flags are valid for the command (e.g., -l for ls is valid, -x is not)
 * 2. Argument count meets min/max requirements
 * 3. Handles combined flags (e.g., -la = -l + -a)
 * 4. Allows --help and --version for all commands
 *
 * @param {string} commandName - Name of the command being validated (e.g., 'ls', 'cd')
 * @param {Array<string>} args - Array of command arguments including flags (e.g., ['-l', '/home'])
 * @returns {{valid: boolean, error: string|null, flags: Array<string>, nonFlags: Array<string>}}
 *          Returns validation result with:
 *          - valid: true if arguments are valid, false otherwise
 *          - error: error message if invalid, null if valid
 *          - flags: array of validated flags (e.g., ['-l', '-a'])
 *          - nonFlags: array of non-flag arguments (e.g., ['/home', 'file.txt'])
 *
 * @example
 * // Valid usage
 * validateArgs('ls', ['-l', '/home'])
 * // Returns: {valid: true, error: null, flags: ['-l'], nonFlags: ['/home']}
 *
 * @example
 * // Invalid flag
 * validateArgs('ls', ['-x'])
 * // Returns: {valid: false, error: "ls: invalid option -- 'x'\r\nTry 'ls --help'...", flags: [], nonFlags: []}
 *
 * @example
 * // Combined flags
 * validateArgs('ls', ['-la'])
 * // Returns: {valid: true, error: null, flags: ['-l', '-a'], nonFlags: []}
 */
export function validateArgs(commandName, args) {
    const spec = commandSpecs[commandName];

    // If no spec defined, skip validation (allow all)
    if (!spec) {
        return {
            valid: true,
            error: null,
            flags: args.filter(arg => arg.startsWith('-')),
            nonFlags: args.filter(arg => !arg.startsWith('-'))
        };
    }

    const flags = [];
    const nonFlags = [];
    const errors = [];

    // Separate flags from non-flag arguments
    for (const arg of args) {
        if (arg.startsWith('-') && arg !== '-') {
            // Handle long options (--option)
            if (arg.startsWith('--')) {
                const longFlag = arg.slice(2);
                // Common long options that should be allowed
                if (['help', 'version'].includes(longFlag)) {
                    flags.push(arg);
                } else {
                    errors.push(`unrecognized option '${arg}'`);
                }
            } else {
                // Handle short options (-o or -abc)
                const flagChars = arg.slice(1).split('');
                for (const char of flagChars) {
                    if (!spec.validFlags.includes(char)) {
                        errors.push(`invalid option -- '${char}'`);
                    } else {
                        flags.push(`-${char}`);
                    }
                }
            }
        } else {
            nonFlags.push(arg);
        }
    }

    // Check for errors
    if (errors.length > 0) {
        return {
            valid: false,
            error: `${commandName}: ${errors[0]}\r\nTry '${commandName} --help' for more information.`,
            flags,
            nonFlags
        };
    }

    // Validate minimum arguments
    if (spec.minArgs !== undefined && nonFlags.length < spec.minArgs) {
        return {
            valid: false,
            error: `${commandName}: missing operand\r\nTry '${commandName} --help' for more information.`,
            flags,
            nonFlags
        };
    }

    // Validate maximum arguments
    if (spec.maxArgs !== undefined && nonFlags.length > spec.maxArgs) {
        return {
            valid: false,
            error: `${commandName}: extra operand '${nonFlags[spec.maxArgs]}'\r\nTry '${commandName} --help' for more information.`,
            flags,
            nonFlags
        };
    }

    return {
        valid: true,
        error: null,
        flags,
        nonFlags
    };
}

/**
 * Helper function to check if a specific flag is present in the flags array.
 *
 * This handles both separate flags (['-l', '-a']) and flags within combined
 * flag strings (e.g., checking 'l' in ['-la']).
 *
 * @param {Array<string>} flags - Array of flags from validateArgs() result
 * @param {string} flag - Single character flag to check for (without dash, e.g., 'l', 'r', 'a')
 * @returns {boolean} True if the flag is present, false otherwise
 *
 * @example
 * const { flags } = validateArgs('ls', ['-la']);
 * hasFlag(flags, 'l')  // Returns: true
 * hasFlag(flags, 'a')  // Returns: true
 * hasFlag(flags, 'R')  // Returns: false
 *
 * @example
 * const { flags } = validateArgs('rm', ['-r', '-f']);
 * hasFlag(flags, 'r')  // Returns: true
 * hasFlag(flags, 'f')  // Returns: true
 */
export function hasFlag(flags, flag) {
    return flags.some(f => f === `-${flag}` || f.slice(1).includes(flag));
}

/**
 * Helper function to extract the value associated with a flag.
 *
 * Some commands accept flags with values (e.g., head -n 10, tail -c 100).
 * This function extracts the value that follows a flag.
 *
 * @param {Array<string>} args - Original arguments array passed to the command
 * @param {string} flag - Single character flag to find value for (without dash)
 * @returns {string|null} The value following the flag, or null if not found or no value
 *
 * @example
 * getFlagValue(['-n', '10', 'file.txt'], 'n')  // Returns: '10'
 * getFlagValue(['-n', '-l'], 'n')              // Returns: null (next arg is a flag)
 * getFlagValue(['-l'], 'n')                    // Returns: null (flag not present)
 *
 * @example
 * // Usage in a command:
 * const lineCount = getFlagValue(args, 'n') || '10';  // Default to 10 if not specified
 */
export function getFlagValue(args, flag) {
    const flagIndex = args.findIndex(arg => arg === `-${flag}`);
    if (flagIndex !== -1 && flagIndex + 1 < args.length) {
        const nextArg = args[flagIndex + 1];
        if (!nextArg.startsWith('-')) {
            return nextArg;
        }
    }
    return null;
}
