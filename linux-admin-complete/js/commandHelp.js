// js/commandHelp.js
// Detailed help information for each command

export const commandHelp = {
    'ls': {
        description: 'List directory contents',
        usage: 'ls [-l]',
        details: 'Lists files and directories in the current directory. Use -l flag for detailed listing with permissions, owner, size, and date.',
        examples: [
            'ls                  - Simple listing',
            'ls -l               - Detailed listing'
        ]
    },
    'cd': {
        description: 'Change directory',
        usage: 'cd [directory]',
        details: 'Changes your current working directory. Use ".." to go up one level, or no arguments to return home.',
        examples: [
            'cd documents        - Enter documents directory',
            'cd ..               - Go up one level',
            'cd                  - Return to home directory',
            'cd /                - Go to root'
        ]
    },
    'pwd': {
        description: 'Print working directory',
        usage: 'pwd',
        details: 'Displays the full path of your current location in the file system.',
        examples: [
            'pwd                 - Show current path'
        ]
    },
    'cat': {
        description: 'Display file contents',
        usage: 'cat <file>',
        details: 'Reads and displays the contents of a file to the terminal.',
        examples: [
            'cat README.txt      - Display README.txt contents',
            'cat documents/notes.md - Display file in subdirectory'
        ]
    },
    'echo': {
        description: 'Print text to terminal',
        usage: 'echo <text>',
        details: 'Outputs text or variables to the terminal. Useful for displaying messages.',
        examples: [
            'echo Hello World    - Print message',
            'echo "Multiple words" - Print phrase with spaces'
        ]
    },
    'mkdir': {
        description: 'Create directory',
        usage: 'mkdir <directory>',
        details: 'Creates a new empty directory with the specified name.',
        examples: [
            'mkdir my_folder     - Create single directory',
            'mkdir projects      - Create projects directory'
        ]
    },
    'rmdir': {
        description: 'Remove empty directory',
        usage: 'rmdir <directory>',
        details: 'Removes an empty directory. Will fail if directory contains files.',
        examples: [
            'rmdir old_folder    - Remove empty directory',
            'rmdir temp          - Remove temp directory'
        ]
    },
    'touch': {
        description: 'Create or update file',
        usage: 'touch <file>',
        details: 'Creates an empty file if it doesn\'t exist, or updates its timestamp if it does.',
        examples: [
            'touch newfile.txt   - Create empty file',
            'touch script.js     - Create JavaScript file'
        ]
    },
    'rm': {
        description: 'Remove files',
        usage: 'rm <file>',
        details: 'Permanently deletes a file. Cannot be undone in this simulation.',
        examples: [
            'rm old.txt          - Delete file',
            'rm temporary.js     - Delete JavaScript file'
        ]
    },
    'mv': {
        description: 'Move or rename files',
        usage: 'mv <source> <destination>',
        details: 'Moves a file to a new location or renames it. If destination is a directory, file is moved there.',
        examples: [
            'mv old.txt new.txt  - Rename file',
            'mv file.txt docs/   - Move file to docs directory'
        ]
    },
    'cp': {
        description: 'Copy files',
        usage: 'cp <source> <destination>',
        details: 'Creates a copy of a file with a new name or in a new location.',
        examples: [
            'cp file.txt backup.txt - Create backup copy',
            'cp README.txt docs/    - Copy to subdirectory'
        ]
    },
    'whoami': {
        description: 'Print current user',
        usage: 'whoami',
        details: 'Displays the username of the current user.',
        examples: [
            'whoami              - Show current user'
        ]
    },
    'date': {
        description: 'Display date and time',
        usage: 'date',
        details: 'Shows the current date and time.',
        examples: [
            'date                - Show current date and time'
        ]
    },
    'clear': {
        description: 'Clear terminal screen',
        usage: 'clear',
        details: 'Clears all text from the terminal, giving you a fresh screen.',
        examples: [
            'clear               - Clear terminal'
        ]
    },
    'help': {
        description: 'Display help information',
        usage: 'help [command]',
        details: 'Shows all available commands, or detailed help for a specific command.',
        examples: [
            'help                - Show all commands',
            'help ls             - Show help for ls command',
            'help cd             - Show help for cd command'
        ]
    },
    'grep': {
        description: 'Search for text pattern in file',
        usage: 'grep <pattern> <file>',
        details: 'Searches for lines containing the specified pattern in a file and displays matching lines.',
        examples: [
            'grep "error" log.txt       - Find lines with "error"',
            'grep "user" data.txt       - Search for "user" in file'
        ]
    },
    'find': {
        description: 'Find files by name',
        usage: 'find <path> -name <pattern>',
        details: 'Recursively searches for files matching a name pattern in a directory.',
        examples: [
            'find . -name "*.txt"       - Find all .txt files',
            'find /home -name "test*"   - Find files starting with "test"'
        ]
    },
    'head': {
        description: 'Show first lines of file',
        usage: 'head [-n lines] <file>',
        details: 'Displays the first 10 lines of a file (or specified number with -n option).',
        examples: [
            'head file.txt              - Show first 10 lines',
            'head -n 5 file.txt         - Show first 5 lines'
        ]
    },
    'tail': {
        description: 'Show last lines of file',
        usage: 'tail [-n lines] <file>',
        details: 'Displays the last 10 lines of a file (or specified number with -n option).',
        examples: [
            'tail file.txt              - Show last 10 lines',
            'tail -n 5 file.txt         - Show last 5 lines'
        ]
    },
    'sort': {
        description: 'Sort file contents',
        usage: 'sort [-r] [-n] <file>',
        details: 'Sorts lines in a file. Use -r for reverse order, -n for numeric sort.',
        examples: [
            'sort names.txt             - Sort alphabetically',
            'sort -r names.txt          - Sort in reverse order',
            'sort -n numbers.txt        - Sort numerically'
        ]
    },
    'uniq': {
        description: 'Remove duplicate lines',
        usage: 'uniq [-c] [-d] [-u] <file>',
        details: 'Removes or reports duplicate lines. Use -c to count, -d for duplicates only, -u for unique only.',
        examples: [
            'uniq items.txt             - Remove duplicate lines',
            'uniq -c items.txt          - Count occurrences',
            'uniq -u items.txt          - Show unique lines only'
        ]
    },
    'wc': {
        description: 'Count lines, words, and bytes',
        usage: 'wc [-l] [-w] [-c] <file>',
        details: 'Counts lines, words, and bytes in a file. Use -l for lines, -w for words, -c for bytes.',
        examples: [
            'wc file.txt                - Show lines, words, bytes',
            'wc -l file.txt             - Count lines only',
            'wc -w file.txt             - Count words only'
        ]
    },
    'chmod': {
        description: 'Change file permissions',
        usage: 'chmod <mode> <file>',
        details: 'Changes file or directory permissions using octal notation. Mode is a 3-digit octal number (e.g., 755, 644). Only the file owner or root can change permissions. First digit: owner, second: group, third: others. Each digit is sum of r(4)+w(2)+x(1).',
        examples: [
            'chmod 755 script.sh         - Make script executable (rwxr-xr-x)',
            'chmod 644 document.txt      - Make file readable (rw-r--r--)',
            'chmod 600 secret.txt        - Private file, owner only (rw-------)',
            'chmod 777 shared.txt        - Full permissions for all (rwxrwxrwx)'
        ]
    },
    'chown': {
        description: 'Change file ownership',
        usage: 'chown <user>:<group> <file>',
        details: 'Changes the owner and group of a file or directory. Only the root user can change file ownership. Use user:group format where both user and group must be valid.',
        examples: [
            'chown user:user myfile.txt   - Change owner and group to user',
            'chown guest:guest secret.txt - Change owner and group to guest',
            'chown root:root system.txt   - Change to root ownership'
        ]
    },
    'su': {
        description: 'Switch user',
        usage: 'su [username]',
        details: 'Switches to another user account. If no username is provided, switches to root. When switching users, the current directory is reset to the target user\'s home directory. Available users: root, user, guest.',
        examples: [
            'su                  - Switch to root user',
            'su user             - Switch to user account',
            'su guest            - Switch to guest account',
            'whoami              - Check current user after switching'
        ]
    }
};

export const getCommandHelp = (command) => {
    return commandHelp[command] || null;
};
