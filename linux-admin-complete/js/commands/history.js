// VALIDATING
// js/commands/history.js
// Display and manage command history

import { formatHistory, getHistoryStorageInfo } from '../commandHistory.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * history command implementation
 * @param {Array} args - Command arguments
 * @param {CommandHistory} historyManager - History manager instance
 * @returns {string} Output
 */
export const historyCommand = (args, historyManager) => {
    if (!historyManager) {
        return 'Error: History not available';
    }

    // Parse options
    const options = {
        clear: args.includes('-c') || args.includes('--clear'),
        info: args.includes('--info'),
        search: args.find(arg => arg.startsWith('-s:'))?.substring(3),
        limit: null
    };

    // Check for numeric limit
    const numArg = args.find(arg => /^\d+$/.test(arg));
    if (numArg) {
        options.limit = parseInt(numArg, 10);
    }

    // Clear history
    if (options.clear) {
        historyManager.clear();
        return '\x1B[32m✓ History cleared\x1B[0m';
    }

    // Show storage info
    if (options.info) {
        const info = getHistoryStorageInfo();
        return `\x1B[1;36mCommand History Information:\x1B[0m\r\n\r\n` +
               `Commands stored: ${info.count}\r\n` +
               `Storage size: ${info.sizeKB} KB\r\n\r\n` +
               `Use \x1B[1mhistory -c\x1B[0m to clear history`;
    }

    // Search history
    if (options.search) {
        const results = historyManager.search(options.search);
        if (results.length === 0) {
            return `No matches found for: ${options.search}`;
        }

        let output = `\x1B[1mMatching commands:\x1B[0m\r\n\r\n`;
        results.forEach((cmd, i) => {
            output += `  ${i + 1}. ${cmd}\r\n`;
        });
        return output;
    }

    // Show history
    return formatHistory(historyManager, options.limit);
};

/**
 * Get help text for history command
 */
export const historyHelp = {
    description: 'Display or manipulate the command history list',
    usage: 'history [n] [-c] [--info] [-s:pattern]',
    details: `Shows previously executed commands with line numbers.

    Options:
      n           Show only last n commands
      -c, --clear Clear the history list
      --info      Show storage information
      -s:pattern  Search history for pattern

    History Expansion:
      !!          Execute last command
      !n          Execute command number n
      !-n         Execute command n lines back
      !prefix     Execute last command starting with 'prefix'`,
    examples: [
        'history         # Show all history',
        'history 10      # Show last 10 commands',
        'history -c      # Clear history',
        'history -s:git  # Search for "git" commands',
        '!!              # Repeat last command',
        '!5              # Repeat command #5',
        '!-2             # Repeat 2nd to last command',
        '!ls             # Repeat last "ls" command'
    ]
};
