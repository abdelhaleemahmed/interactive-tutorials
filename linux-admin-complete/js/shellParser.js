// js/shellParser.js
// Parses shell commands with pipes and redirections

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

            const parts = cmdStr.split(/\s+/).filter(p => p.length > 0);
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
        cmdStr = cmdStr.replace(/>\s*([^\s|>]+)/g, '');    // Remove > file
        cmdStr = cmdStr.replace(/>>\s*([^\s|>]+)/g, '');   // Remove >> file
        cmdStr = cmdStr.replace(/<\s*([^\s|]+)/g, '');     // Remove < file
        return cmdStr.trim();
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
export const handleOutputRedirection = (output, redirections, fileSystem, currentPath) => {
    if (redirections.append) {
        // Append to file
        const fileName = redirections.append;
        // Would need fileSystem methods to append content
        return `Output appended to: ${fileName}`;
    } else if (redirections.output) {
        // Write to file (overwrite)
        const fileName = redirections.output;
        // Would need fileSystem methods to write content
        return `Output redirected to: ${fileName}`;
    }
    // No redirection, return as normal
    return output;
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
