// js/shellParser.js
// Parses shell commands with pipes and redirections

import { getCurrentUser } from './userManagement.js';

export class ShellParser {
    constructor() {
        this.pipes = [];
        this.redirections = {
            input: null,   // < file
            output: null,  // > file (overwrite)
            append: null   // >> file (append)
        };
        this.commands = [];
    }

    /**
     * Parse a command line with pipes and redirections
     * Examples:
     *   cat file.txt | grep "error"
     *   ls > output.txt
     *   grep "test" < input.txt
     *   echo "line" >> log.txt
     *   cat file.txt | sort | uniq
     */
    parse(commandLine) {
        // First, extract redirections (they apply to the entire pipeline)
        this.extractRedirections(commandLine);

        // Split by pipe symbol to get individual commands
        const commandStrings = commandLine.split('|').map(s => s.trim());

        // Parse each command
        this.commands = commandStrings.map(cmdStr => {
            // Remove redirection operators from command
            cmdStr = this.removeRedirections(cmdStr);

            // Parse arguments with proper quote handling
            const parts = this.parseArgs(cmdStr);
            return {
                name: parts[0],
                args: parts.slice(1)
            };
        });

        return {
            commands: this.commands,
            redirections: this.redirections,
            hasPipes: this.commands.length > 1
        };
    }

    /**
     * Extract and remove redirection operators from command line
     */
    extractRedirections(commandLine) {
        // Match > file, >> file, < file
        const outputMatch = commandLine.match(/>\s*([^\s|>]+)/);
        const appendMatch = commandLine.match(/>>\s*([^\s|>]+)/);
        const inputMatch = commandLine.match(/<\s*([^\s|]+)/);

        if (appendMatch) {
            this.redirections.append = appendMatch[1];
        } else if (outputMatch) {
            this.redirections.output = outputMatch[1];
        }

        if (inputMatch) {
            this.redirections.input = inputMatch[1];
        }
    }

    /**
     * Remove redirection operators from a command string
     */
    removeRedirections(cmdStr) {
        // Remove >, >>, < and their filenames
        // IMPORTANT: Remove >> BEFORE > to avoid leaving a stray >
        cmdStr = cmdStr.replace(/>>\s*([^\s|>]+)/g, '');   // Remove >> file (check first!)
        cmdStr = cmdStr.replace(/>\s*([^\s|>]+)/g, '');    // Remove > file
        cmdStr = cmdStr.replace(/<\s*([^\s|]+)/g, '');     // Remove < file
        return cmdStr.trim();
    }

    /**
     * Parse command arguments handling quotes properly
     * Removes quotes but preserves spaces within quoted strings
     */
    parseArgs(cmdStr) {
        const args = [];
        let current = '';
        let inSingleQuote = false;
        let inDoubleQuote = false;
        let escaped = false;

        for (let i = 0; i < cmdStr.length; i++) {
            const char = cmdStr[i];

            if (escaped) {
                current += char;
                escaped = false;
                continue;
            }

            if (char === '\\' && !inSingleQuote) {
                escaped = true;
                continue;
            }

            if (char === "'" && !inDoubleQuote) {
                inSingleQuote = !inSingleQuote;
                continue;
            }

            if (char === '"' && !inSingleQuote) {
                inDoubleQuote = !inDoubleQuote;
                continue;
            }

            if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
                if (current.length > 0) {
                    args.push(current);
                    current = '';
                }
                continue;
            }

            current += char;
        }

        if (current.length > 0) {
            args.push(current);
        }

        return args;
    }

    /**
     * Check if command line contains pipes
     */
    hasPipes(commandLine) {
        return commandLine.includes('|');
    }

    /**
     * Check if command line contains redirections
     */
    hasRedirections(commandLine) {
        return /[<>]/.test(commandLine);
    }

    /**
     * Check if a command line needs special parsing
     */
    needsShellParsing(commandLine) {
        return this.hasPipes(commandLine) || this.hasRedirections(commandLine);
    }
}

/**
 * Execute a pipeline of commands
 * Each command's output becomes the next command's input
 */
export const executePipeline = (commands, handlers, fileSystem) => {
    let output = '';

    // Execute first command (may have input redirection)
    // For now, we'll implement basic piping without input redirection
    // since commands in our system don't read from stdin

    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        const handler = handlers[cmd.name];

        if (!handler) {
            return `bash: ${cmd.name}: command not found`;
        }

        // For piped commands, we need to:
        // 1. Execute the command
        // 2. If it's not the last command, capture output and pass to next command
        // 3. If it's the last command, return the output

        try {
            output = handler(cmd.args);

            // If this is not the last command and output exists,
            // we need to pipe it to the next command
            if (i < commands.length - 1 && output) {
                // For text processing commands that accept input via args,
                // we'd need to pass the output. This is simplified for now.
                // In a real shell, this would be done via stdin.

                // For now, store output to potentially be used by next command
                // This is a limitation we'll need to work around
            }
        } catch (error) {
            return `Error executing ${cmd.name}: ${error.message}`;
        }
    }

    return output;
};

/**
 * Handle output redirection
 * Writes output to a file instead of returning it
 */
export const handleOutputRedirection = (output, redirections, utils) => {
    if (!redirections.append && !redirections.output) {
        // No redirection, return output as normal
        return output;
    }

    try {
        const fileName = redirections.append || redirections.output;
        console.log('[Redirection] Writing to file:', fileName);
        const resolved = utils.resolvePath(fileName);  // Returns array like ['home', 'user', 'file.txt']
        console.log('[Redirection] Resolved path:', resolved);
        const existing = utils.getPathObject(resolved);
        console.log('[Redirection] Existing file:', existing);

    // Get parent directory
    const pathParts = [...resolved];  // Copy the array
    const fileNameOnly = pathParts.pop();
    const parentDir = utils.getPathObject(pathParts);

    if (!parentDir || parentDir.type !== 'directory') {
        return `bash: ${fileName}: No such file or directory`;
    }

    if (redirections.append && existing && existing.type === 'file') {
        // Append to existing file
        existing.content += '\n' + output;
        existing.modified = Date.now();
        existing.size = existing.content.length;
        return '';  // Success - no output to terminal
    } else if (redirections.output || (redirections.append && !existing)) {
        // Create new file or overwrite existing
        if (existing && existing.type === 'directory') {
            return `bash: ${fileName}: Is a directory`;
        }

        const currentUser = getCurrentUser();
        const newFile = {
            type: 'file',
            content: output,
            size: output.length,
            owner: currentUser.username || 'user',
            group: currentUser.username || 'user',
            permissions: 0o644,
            created: Date.now(),
            modified: Date.now(),
            date: utils.getCurrentDateFormatted()
        };

        parentDir.children[fileNameOnly] = newFile;
        console.log('[Redirection] File created successfully:', fileNameOnly);
        return '';  // Success - no output to terminal
    }

    return output;
    } catch (error) {
        console.error('[Redirection] Error:', error);
        return `bash: ${error.message}`;
    }
};

/**
 * Handle input redirection
 * Reads from a file instead of using arguments
 */
export const handleInputRedirection = (command, redirections, fileSystem) => {
    if (redirections.input) {
        // Read from file and use as input
        const fileName = redirections.input;
        // Would need fileSystem methods to read content
        return {
            input: `Content from ${fileName}`,
            fromFile: true
        };
    }
    return {
        fromFile: false
    };
};
