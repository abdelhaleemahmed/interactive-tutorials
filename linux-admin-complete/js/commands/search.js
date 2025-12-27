// js/commands/search.js
// Search command for finding commands

import { getSearchEngine } from '../searchEngine.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * search command implementation
 * @param {Array} args - Command arguments
 * @returns {string} Output
 */
export const searchCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('search', args);
    if (!validation.valid) {
        return validation.error;
    }

    const searchEngine = getSearchEngine();

    // Show all categories if no query
    if (args.length === 0 || args.includes('--all')) {
        return showAllCommands(searchEngine);
    }

    // Show category if --category flag
    const catIndex = args.indexOf('--category');
    if (catIndex !== -1 && args[catIndex + 1]) {
        return showCategory(searchEngine, args[catIndex + 1]);
    }

    // Perform search
    const query = args.join(' ');
    const results = searchEngine.search(query);

    if (results.length === 0) {
        return `No commands found for: "${query}"\r\n\r\n` +
               `Try:\r\n` +
               `  search --all       # Show all commands\r\n` +
               `  search list        # Search for "list" commands\r\n` +
               `  help               # Show command help`;
    }

    return formatSearchResults(query, results);
};

/**
 * Format search results
 */
function formatSearchResults(query, results) {
    let output = `\x1B[1;36m🔍 Search results for "${query}":\x1B[0m\r\n\r\n`;

    results.forEach((result, i) => {
        output += `${i + 1}. \x1B[1;32m${result.cmd}\x1B[0m `;
        output += `\x1B[2m(${result.category})\x1B[0m\r\n`;
        output += `   ${result.description}\r\n`;

        if (i < results.length - 1) {
            output += '\r\n';
        }
    });

    output += `\r\n\x1B[2mTip: Use 'man ${results[0].cmd}' for detailed help\x1B[0m`;

    return output;
}

/**
 * Show all commands grouped by category
 */
function showAllCommands(searchEngine) {
    const categorized = searchEngine.getByCategory();

    let output = '\x1B[1;36m📚 All Available Commands\x1B[0m\r\n\r\n';

    Object.entries(categorized).sort().forEach(([category, commands]) => {
        output += `\x1B[1m${category}:\x1B[0m\r\n`;

        commands.forEach(cmd => {
            output += `  \x1B[32m${cmd.cmd.padEnd(12)}\x1B[0m ${cmd.description}\r\n`;
        });

        output += '\r\n';
    });

    output += `\x1B[2mTotal: ${searchEngine.getAllCommands().length} commands\x1B[0m\r\n`;
    output += `\x1B[2mUse 'search <keyword>' to find specific commands\x1B[0m`;

    return output;
}

/**
 * Show commands in a specific category
 */
function showCategory(searchEngine, categoryName) {
    const categorized = searchEngine.getByCategory();
    const category = Object.keys(categorized).find(cat =>
        cat.toLowerCase() === categoryName.toLowerCase()
    );

    if (!category) {
        const available = Object.keys(categorized).join(', ');
        return `Category "${categoryName}" not found.\r\n\r\n` +
               `Available categories:\r\n  ${available}`;
    }

    let output = `\x1B[1;36m${category} Commands:\x1B[0m\r\n\r\n`;

    categorized[category].forEach(cmd => {
        output += `\x1B[1;32m${cmd.cmd}\x1B[0m\r\n`;
        output += `  ${cmd.description}\r\n\r\n`;
    });

    return output;
}

/**
 * Help text for search command
 */
export const searchHelp = {
    description: 'Search for commands and get quick reference',
    usage: 'search [query] [--all] [--category NAME]',
    details: `Search through available commands by name, keyword, or description.

    Options:
      query           Search term or keyword
      --all           Show all commands grouped by category
      --category CAT  Show commands in specific category

    Categories:
      - File Operations
      - Navigation
      - Text Operations
      - Editors/Viewers
      - Permissions
      - Search
      - Processes
      - Environment
      - Users
      - Help
      - System`,
    examples: [
        'search file         # Find file-related commands',
        'search copy         # Search for copy commands',
        'search --all        # Show all commands',
        'search --category Permissions  # Show permission commands'
    ]
};
