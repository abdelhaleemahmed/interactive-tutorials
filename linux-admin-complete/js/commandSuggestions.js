// js/commandSuggestions.js
// Command suggestions and typo detection

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching to detect typos
 *
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Edit distance between strings
 */
function levenshteinDistance(a, b) {
    const matrix = [];

    // Initialize first column
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Initialize first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Common typo patterns
 * Maps common mistakes to correct commands
 */
const commonMistakes = {
    // Missing/extra letters
    'lst': 'ls',
    'lss': 'ls',
    'sl': 'ls',
    'cta': 'cat',
    'catt': 'cat',
    'cler': 'clear',
    'claer': 'clear',
    'clera': 'clear',
    'mkdi': 'mkdir',
    'mkdri': 'mkdir',
    'mkidr': 'mkdir',
    'chmdo': 'chmod',
    'chmodd': 'chmod',
    'pwdd': 'pwd',
    'pdw': 'pwd',
    'cdd': 'cd',
    'dc': 'cd',
    'grpe': 'grep',
    'gerp': 'grep',
    'greo': 'grep',
    'fnd': 'find',
    'fidn': 'find',
    'toch': 'touch',
    'touhc': 'touch',
    'touche': 'touch',
    'echoo': 'echo',
    'ehco': 'echo',
    'rmm': 'rm',
    'rmd': 'rm',
    'rmdir': 'rmdir',
    'mvv': 'mv',
    'mve': 'mv',
    'cpp': 'cp',
    'cpy': 'cp',
    'cpo': 'cp',
    'nano ': 'nano',
    'nno': 'nano',
    'vmi': 'vim',
    'vi m': 'vim',
    'les': 'less',
    'mor': 'more',
    'chonw': 'chown',
    'chowwn': 'chown',
    'chorn': 'chown',
    'pss': 'ps',
    'kil': 'kill',
    'killl': 'kill',
    'wc ': 'wc',
    'headd': 'head',
    'taill': 'tail',
    'sortt': 'sort',
    'uniqq': 'uniq',
    'sedc': 'sed',
    'whcih': 'which',
    'whci': 'which',
    'whersi': 'whereis',
    'locaet': 'locate',
    'locat': 'locate',
    'slep': 'sleep',
    'slepp': 'sleep',
    'jobss': 'jobs',
    'fgg': 'fg',
    'bgg': 'bg',
    'expotr': 'export',
    'exprot': 'export',
    'envv': 'env',
    'umaks': 'umask',
    'umassk': 'umask',
    'statt': 'stat',
    'stt': 'stat',
    'suu': 'su',
    'whoamii': 'whoami',
    'datee': 'date',
    'man ': 'man',
    'mann': 'man',
    'halp': 'help',
    'hlep': 'help'
};

/**
 * Suggest similar commands for a typo
 * Uses Levenshtein distance to find close matches
 *
 * @param {string} input - The command that wasn't found
 * @param {string[]} availableCommands - List of valid commands
 * @returns {string[]} Array of suggested commands
 */
export function suggestCommand(input, availableCommands) {
    const MAX_DISTANCE = 2;
    const MAX_SUGGESTIONS = 3;

    const suggestions = availableCommands
        .map(cmd => ({
            command: cmd,
            distance: levenshteinDistance(input.toLowerCase(), cmd.toLowerCase())
        }))
        .filter(s => s.distance <= MAX_DISTANCE && s.distance > 0)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, MAX_SUGGESTIONS)
        .map(s => s.command);

    return suggestions;
}

/**
 * Check if input matches a common typo pattern
 *
 * @param {string} input - The command to check
 * @returns {string|null} Corrected command or null
 */
export function correctCommonMistake(input) {
    const normalized = input.toLowerCase();
    return commonMistakes[normalized] || null;
}

/**
 * Generate enhanced error message with suggestions
 *
 * @param {string} cmd - The command that wasn't found
 * @param {Object} handlers - Available command handlers
 * @returns {string} Formatted error message with suggestions
 */
export function getCommandNotFoundMessage(cmd, handlers) {
    let message = `bash: ${cmd}: command not found`;

    // Check for common mistakes first
    const correction = correctCommonMistake(cmd);
    if (correction) {
        message += `\r\n\r\n\x1B[1;33mDid you mean:\x1B[0m ${correction}`;
        return message;
    }

    // Check for similar commands using Levenshtein distance
    const suggestions = suggestCommand(cmd, Object.keys(handlers));
    if (suggestions.length > 0) {
        message += '\r\n\r\n\x1B[1;33mDid you mean:\x1B[0m';
        suggestions.forEach(s => {
            message += `\r\n  ${s}`;
        });
    }

    // Helpful hints based on the input
    if (cmd.includes(' ')) {
        message += '\r\n\r\n\x1B[1;36mTip:\x1B[0m Command and arguments should be separated by spaces.';
    }

    if (cmd.length > 0 && cmd[0] === cmd[0].toUpperCase()) {
        message += '\r\n\r\n\x1B[1;36mTip:\x1B[0m Linux commands are case-sensitive and usually lowercase.';
    }

    if (cmd.includes('\\') || cmd.includes('/')) {
        message += '\r\n\r\n\x1B[1;36mTip:\x1B[0m Try using quotes for paths with special characters.';
    }

    // Encourage using help
    if (suggestions.length === 0) {
        message += '\r\n\r\nType \x1B[1mhelp\x1B[0m to see all available commands.';
    }

    return message;
}

/**
 * Validate command before execution
 * Can be used to provide warnings for dangerous commands
 *
 * @param {string} command - The full command string
 * @returns {string|null} Warning message or null if safe
 */
export function validateCommand(command) {
    const dangerousPatterns = [
        {
            pattern: /rm\s+-rf\s+\//,
            warning: '⚠️  \x1B[1;31mWARNING:\x1B[0m This would delete your entire system!\r\n' +
                     'In a real system, this is extremely dangerous.'
        },
        {
            pattern: /chmod\s+-R\s+777/,
            warning: '⚠️  \x1B[1;33mWARNING:\x1B[0m Setting 777 permissions recursively is a security risk!\r\n' +
                     'Everyone can read, write, and execute all files.'
        },
        {
            pattern: /dd\s+if=.*of=\/dev/,
            warning: '⚠️  \x1B[1;31mWARNING:\x1B[0m This could overwrite disk data!\r\n' +
                     'Be very careful with dd commands.'
        },
        {
            pattern: />\/dev\/sda/,
            warning: '⚠️  \x1B[1;31mWARNING:\x1B[0m Writing to disk devices is dangerous!'
        },
        {
            pattern: /:\(\)\{.*\};\s*:/,
            warning: '⚠️  \x1B[1;31mWARNING:\x1B[0m This looks like a fork bomb!\r\n' +
                     'It could crash your system.'
        }
    ];

    for (const { pattern, warning } of dangerousPatterns) {
        if (pattern.test(command)) {
            return warning;
        }
    }

    return null;
}

/**
 * Get contextual help based on common errors
 *
 * @param {string} error - The error message
 * @returns {string|null} Helpful tip or null
 */
export function getContextualHelp(error) {
    const helpMap = {
        'Permission denied': 'Try using \x1B[1msudo\x1B[0m for system files, or check permissions with \x1B[1mls -l\x1B[0m',
        'No such file or directory': 'Check your spelling and use \x1B[1mTab\x1B[0m for auto-completion',
        'Is a directory': 'Use \x1B[1mcd\x1B[0m to enter directories, or \x1B[1mls\x1B[0m to list contents',
        'Not a directory': 'You\'re trying to cd into a file. Use \x1B[1mcat\x1B[0m to read files',
        'Directory not empty': 'Use \x1B[1mrm -r\x1B[0m to remove directories with contents',
        'File exists': 'The file already exists. Use a different name or remove the existing file first'
    };

    for (const [key, help] of Object.entries(helpMap)) {
        if (error.includes(key)) {
            return `\r\n\x1B[1;36mTip:\x1B[0m ${help}`;
        }
    }

    return null;
}
