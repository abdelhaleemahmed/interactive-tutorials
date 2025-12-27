// VALIDATING
// js/commands/man.js
// Manual pages command - Display command documentation

import { validateArgs } from '../argumentValidator.js';

/**
 * Man pages database
 * Each command has: name, synopsis, description, options, examples
 */
const manPages = {
    'ls': {
        name: 'ls',
        synopsis: 'ls [OPTION]... [FILE]...',
        description: 'List information about files and directories.',
        options: [
            { flag: '-a, --all', desc: 'Do not ignore entries starting with .' },
            { flag: '-l', desc: 'Use a long listing format' },
            { flag: '-h, --human-readable', desc: 'Print sizes in human readable format' },
            { flag: '-R, --recursive', desc: 'List subdirectories recursively' },
            { flag: '-t', desc: 'Sort by modification time, newest first' },
            { flag: '-r, --reverse', desc: 'Reverse order while sorting' }
        ],
        examples: [
            'ls              # List files in current directory',
            'ls -la          # List all files with details',
            'ls -lh          # List with human-readable sizes',
            'ls -R           # Recursive listing'
        ]
    },
    'cd': {
        name: 'cd',
        synopsis: 'cd [DIRECTORY]',
        description: 'Change the current working directory.',
        options: [
            { flag: '~', desc: 'Change to home directory' },
            { flag: '-', desc: 'Change to previous directory' },
            { flag: '..', desc: 'Change to parent directory' },
            { flag: '.', desc: 'Stay in current directory' }
        ],
        examples: [
            'cd /home        # Change to /home',
            'cd ~            # Change to home directory',
            'cd ..           # Go up one directory',
            'cd -            # Go to previous directory'
        ]
    },
    'pwd': {
        name: 'pwd',
        synopsis: 'pwd [OPTION]',
        description: 'Print the full pathname of the current working directory.',
        options: [
            { flag: '-L', desc: 'Print symbolic link if in one (default)' },
            { flag: '-P', desc: 'Print physical directory, avoiding symlinks' }
        ],
        examples: [
            'pwd             # Show current directory'
        ]
    },
    'cat': {
        name: 'cat',
        synopsis: 'cat [OPTION] [FILE]...',
        description: 'Concatenate and print files.',
        options: [
            { flag: '-n', desc: 'Number all output lines' },
            { flag: '-b', desc: 'Number non-blank output lines' },
            { flag: '-s', desc: 'Squeeze multiple blank lines' },
            { flag: '-E', desc: 'Display $ at end of each line' }
        ],
        examples: [
            'cat file.txt    # Display file contents',
            'cat -n file.txt # Display with line numbers',
            'cat file1 file2 # Concatenate files'
        ]
    },
    'mkdir': {
        name: 'mkdir',
        synopsis: 'mkdir [OPTION] DIRECTORY...',
        description: 'Create directories.',
        options: [
            { flag: '-p, --parents', desc: 'Make parent directories as needed' },
            { flag: '-m, --mode=MODE', desc: 'Set file mode (permissions)' },
            { flag: '-v, --verbose', desc: 'Print a message for each created directory' }
        ],
        examples: [
            'mkdir newdir    # Create directory',
            'mkdir -p a/b/c  # Create nested directories',
            'mkdir -m 755 dir # Create with specific permissions'
        ]
    },
    'rm': {
        name: 'rm',
        synopsis: 'rm [OPTION]... FILE...',
        description: 'Remove files or directories.',
        options: [
            { flag: '-f, --force', desc: 'Ignore nonexistent files, never prompt' },
            { flag: '-i', desc: 'Prompt before every removal' },
            { flag: '-r, -R, --recursive', desc: 'Remove directories and their contents' },
            { flag: '-v, --verbose', desc: 'Explain what is being done' }
        ],
        examples: [
            'rm file.txt     # Remove file',
            'rm -r directory # Remove directory recursively',
            'rm -i file.txt  # Prompt before removal'
        ]
    },
    'cp': {
        name: 'cp',
        synopsis: 'cp [OPTION] SOURCE DEST',
        description: 'Copy files and directories.',
        options: [
            { flag: '-r, -R, --recursive', desc: 'Copy directories recursively' },
            { flag: '-i, --interactive', desc: 'Prompt before overwrite' },
            { flag: '-f, --force', desc: 'Force copy, remove destinations' },
            { flag: '-p', desc: 'Preserve mode, ownership, timestamps' },
            { flag: '-v, --verbose', desc: 'Explain what is being done' }
        ],
        examples: [
            'cp file1 file2  # Copy file1 to file2',
            'cp -r dir1 dir2 # Copy directory',
            'cp -p file1 file2 # Preserve attributes'
        ]
    },
    'mv': {
        name: 'mv',
        synopsis: 'mv [OPTION] SOURCE DEST',
        description: 'Move (rename) files.',
        options: [
            { flag: '-i, --interactive', desc: 'Prompt before overwrite' },
            { flag: '-f, --force', desc: 'Do not prompt before overwriting' },
            { flag: '-n, --no-clobber', desc: 'Do not overwrite existing file' },
            { flag: '-v, --verbose', desc: 'Explain what is being done' }
        ],
        examples: [
            'mv file1 file2  # Rename file1 to file2',
            'mv file dir/    # Move file to directory',
            'mv -i file dest # Prompt before overwrite'
        ]
    },
    'chmod': {
        name: 'chmod',
        synopsis: 'chmod [OPTION] MODE FILE',
        description: 'Change file mode bits (permissions).',
        options: [
            { flag: '-R, --recursive', desc: 'Change files and directories recursively' },
            { flag: '-v, --verbose', desc: 'Output a diagnostic for every file processed' },
            { flag: '-c, --changes', desc: 'Like verbose but report only when a change is made' }
        ],
        examples: [
            'chmod 755 file  # rwxr-xr-x',
            'chmod 644 file  # rw-r--r--',
            'chmod +x file   # Add execute permission',
            'chmod -w file   # Remove write permission'
        ]
    },
    'chown': {
        name: 'chown',
        synopsis: 'chown [OPTION] OWNER[:GROUP] FILE',
        description: 'Change file owner and group.',
        options: [
            { flag: '-R, --recursive', desc: 'Operate on files and directories recursively' },
            { flag: '-v, --verbose', desc: 'Output a diagnostic for every file processed' },
            { flag: '-c, --changes', desc: 'Like verbose but report only when a change is made' }
        ],
        examples: [
            'chown user file   # Change owner',
            'chown user:group file # Change owner and group',
            'chown -R user dir # Recursive change'
        ]
    },
    'grep': {
        name: 'grep',
        synopsis: 'grep [OPTIONS] PATTERN [FILE...]',
        description: 'Search for PATTERN in each FILE.',
        options: [
            { flag: '-i, --ignore-case', desc: 'Ignore case distinctions' },
            { flag: '-v, --invert-match', desc: 'Select non-matching lines' },
            { flag: '-n, --line-number', desc: 'Print line numbers' },
            { flag: '-r, --recursive', desc: 'Search recursively' },
            { flag: '-c, --count', desc: 'Print count of matching lines' }
        ],
        examples: [
            'grep "text" file # Search for text in file',
            'grep -i "text" file # Case-insensitive search',
            'grep -n "text" file # Show line numbers'
        ]
    },
    'find': {
        name: 'find',
        synopsis: 'find [PATH] [OPTIONS]',
        description: 'Search for files in a directory hierarchy.',
        options: [
            { flag: '-name PATTERN', desc: 'Search by name' },
            { flag: '-type [f|d]', desc: 'Search by type (file/directory)' },
            { flag: '-size [+|-]N', desc: 'Search by size' },
            { flag: '-mtime N', desc: 'Modified N days ago' },
            { flag: '-perm MODE', desc: 'Search by permissions' }
        ],
        examples: [
            'find . -name "*.txt"  # Find all .txt files',
            'find . -type d        # Find directories only',
            'find . -size +1M      # Files larger than 1MB'
        ]
    },
    'ps': {
        name: 'ps',
        synopsis: 'ps [OPTIONS]',
        description: 'Report a snapshot of current processes.',
        options: [
            { flag: 'a', desc: 'Show processes for all users' },
            { flag: 'u', desc: 'Display user-oriented format' },
            { flag: 'x', desc: 'Show processes without controlling terminal' },
            { flag: '-e, -A', desc: 'Select all processes' },
            { flag: '-f', desc: 'Full-format listing' }
        ],
        examples: [
            'ps              # Show your processes',
            'ps aux          # Show all processes',
            'ps -ef          # Full format listing'
        ]
    },
    'kill': {
        name: 'kill',
        synopsis: 'kill [-SIGNAL] PID',
        description: 'Send a signal to a process.',
        options: [
            { flag: '-9, -SIGKILL', desc: 'Force kill (cannot be caught)' },
            { flag: '-15, -SIGTERM', desc: 'Terminate gracefully (default)' },
            { flag: '-HUP', desc: 'Hangup signal' },
            { flag: '-l', desc: 'List all signal names' }
        ],
        examples: [
            'kill 1234       # Terminate process 1234',
            'kill -9 1234    # Force kill process 1234',
            'kill -HUP 1234  # Send HUP signal'
        ]
    },
    'man': {
        name: 'man',
        synopsis: 'man COMMAND',
        description: 'Display manual pages for commands.',
        options: [
            { flag: 'COMMAND', desc: 'The command to get help for' }
        ],
        examples: [
            'man ls          # Show manual for ls',
            'man chmod       # Show manual for chmod',
            'man man         # Show this manual'
        ]
    },
    'help': {
        name: 'help',
        synopsis: 'help [COMMAND]',
        description: 'Display help information about builtin commands.',
        options: [
            { flag: 'COMMAND', desc: 'Optional command to get specific help' }
        ],
        examples: [
            'help            # Show all available commands',
            'help ls         # Show detailed help for ls'
        ]
    }
};

/**
 * Format a man page for display
 */
function formatManPage(page) {
    let output = [];

    // Header
    output.push(`\x1B[1m${page.name.toUpperCase()}(1)\x1B[0m`);
    output.push('');

    // NAME section
    output.push('\x1B[1mNAME\x1B[0m');
    output.push(`    ${page.name} - ${page.description}`);
    output.push('');

    // SYNOPSIS section
    output.push('\x1B[1mSYNOPSIS\x1B[0m');
    output.push(`    ${page.synopsis}`);
    output.push('');

    // DESCRIPTION section
    output.push('\x1B[1mDESCRIPTION\x1B[0m');
    output.push(`    ${page.description}`);
    output.push('');

    // OPTIONS section
    if (page.options && page.options.length > 0) {
        output.push('\x1B[1mOPTIONS\x1B[0m');
        page.options.forEach(opt => {
            output.push(`    \x1B[1m${opt.flag}\x1B[0m`);
            output.push(`        ${opt.desc}`);
            output.push('');
        });
    }

    // EXAMPLES section
    if (page.examples && page.examples.length > 0) {
        output.push('\x1B[1mEXAMPLES\x1B[0m');
        page.examples.forEach(example => {
            output.push(`    ${example}`);
        });
        output.push('');
    }

    return output.join('\r\n');
}

/**
 * man command implementation
 */
export const manCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('man', args);
    if (!validation.valid) {
        return validation.error;
    }

    if (args.length === 0) {
        return 'What manual page do you want?\r\n' +
               'For example, try: man ls\r\n\r\n' +
               'Available manual pages:\r\n' +
               '  ' + Object.keys(manPages).sort().join(', ');
    }

    const commandName = args[0].toLowerCase();

    if (!manPages[commandName]) {
        return `No manual entry for ${commandName}\r\n\r\n` +
               'Try "man man" for help, or "help" for a list of available commands.';
    }

    return formatManPage(manPages[commandName]);
};
