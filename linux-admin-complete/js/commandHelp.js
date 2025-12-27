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
        details: 'Outputs text or variables to the terminal. Variables are expanded using $VAR or ${VAR} syntax. Use \\$ to print a literal dollar sign.',
        examples: [
            'echo Hello World      - Print message',
            'echo "Multiple words" - Print phrase with spaces',
            'echo $HOME            - Print HOME variable',
            'echo "User: $USER"    - Variable in string',
            'echo \\$HOME           - Print literal $HOME'
        ]
    },
    'mkdir': {
        description: 'Create directories',
        usage: 'mkdir [-p] <directory>',
        details: 'Creates new directories with default permissions (755). Requires write permission on parent directory. Use -p flag to create parent directories as needed.',
        examples: [
            'mkdir my_folder     - Create single directory',
            'mkdir projects      - Create projects directory',
            'mkdir -p path/to/dir - Create nested directories'
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
        description: 'Remove files and directories',
        usage: 'rm [-r] <file|directory>',
        details: 'Permanently deletes files or directories. Requires write permission on parent directory. Use -r flag for directories. Cannot be undone.',
        examples: [
            'rm old.txt          - Delete file',
            'rm temporary.js     - Delete JavaScript file',
            'rm -r olddir        - Delete directory recursively'
        ]
    },
    'mv': {
        description: 'Move or rename files and directories',
        usage: 'mv <source> <destination>',
        details: 'Moves or renames files and directories. Requires write permission on source directory (to delete) and destination directory (to create). Preserves ownership and permissions.',
        examples: [
            'mv old.txt new.txt  - Rename file',
            'mv file.txt docs/   - Move file to docs directory',
            'mv mydir newname    - Rename directory'
        ]
    },
    'cp': {
        description: 'Copy files and directories',
        usage: 'cp [-r] <source> <destination>',
        details: 'Creates a copy of a file or directory. Requires read permission on source and write permission on destination directory. Use -r flag for directories.',
        examples: [
            'cp file.txt backup.txt - Create backup copy',
            'cp README.txt docs/    - Copy to subdirectory',
            'cp -r mydir newdir     - Copy directory recursively'
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
        description: 'Search for files matching criteria',
        usage: 'find <path> [-type f|d] [-name pattern] [-size +N|-N] [-perm mode] [-user username] [-empty]',
        details: 'Recursively searches for files matching specified criteria. Supports multiple filters that combine with AND logic. Pattern matching supports * (any chars) and ? (single char) wildcards.',
        examples: [
            'find . -name "*.txt"           - Find all .txt files',
            'find /home -name "test*"       - Find files starting with "test"',
            'find . -type f                 - Find only files',
            'find . -type d                 - Find only directories',
            'find . -size +1000             - Find files larger than 1000 bytes',
            'find . -size -500              - Find files smaller than 500 bytes',
            'find . -perm 644               - Find files with 644 permissions',
            'find . -user guest             - Find files owned by guest',
            'find . -empty                  - Find empty files and directories',
            'find . -type f -name "*.log" -size +100 - Combine filters'
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
        details: 'Changes file or directory permissions. Supports 3-digit octal (755), 4-digit octal (4755) for special bits, and symbolic notation (u+x, g-w, u+s). Symbolic: who (u/g/o/a) + operator (+/-/=) + perms (r/w/x/s/t). Special bits: SUID (4000/u+s), SGID (2000/g+s), Sticky (1000/+t). Only owner or root can change permissions.',
        examples: [
            'chmod 755 script.sh         - Octal: Make executable (rwxr-xr-x)',
            'chmod u+x script.sh         - Symbolic: Add execute for user',
            'chmod g-w file.txt          - Symbolic: Remove write for group',
            'chmod o=r public.txt        - Symbolic: Set other to read-only',
            'chmod a+r doc.txt           - Symbolic: Add read for all',
            'chmod u=rwx,g=rx,o= file    - Symbolic: Multiple modes',
            'chmod 4755 program          - Octal: Set SUID (rwsr-xr-x)',
            'chmod 2755 directory        - Octal: Set SGID (rwxr-sr-x)',
            'chmod 1777 /tmp             - Octal: Set sticky (rwxrwxrwt)',
            'chmod u+s program           - Symbolic: Add SUID',
            'chmod g+s directory         - Symbolic: Add SGID',
            'chmod +t directory          - Symbolic: Add sticky bit'
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
    },
    'sleep': {
        description: 'Delay for specified number of seconds',
        usage: 'sleep <seconds>',
        details: 'Pauses execution for the specified time. Useful for testing background jobs with & operator. In foreground mode, simulates delay. In background mode, creates an actual job.',
        examples: [
            'sleep 5              - Wait 5 seconds (simulated)',
            'sleep 10 &           - Sleep 10 seconds in background',
            '[1] 1234             - Shows job number and PID',
            'jobs                 - See background sleep job'
        ]
    },
    'jobs': {
        description: 'Display status of background jobs',
        usage: 'jobs [-l] [-r] [-s]',
        details: 'Lists all background jobs with their status. Use -l to show PIDs, -r for running jobs only, -s for stopped jobs only. Jobs marked with + are most recent, - is second most recent.',
        examples: [
            'jobs                 - List all background jobs',
            'jobs -l              - List with process IDs',
            'jobs -r              - Show running jobs only',
            'jobs -s              - Show stopped jobs only'
        ]
    },
    'fg': {
        description: 'Bring background job to foreground',
        usage: 'fg [%job_spec]',
        details: 'Brings a background job to the foreground. Without arguments, uses most recent job. Spec can be %n for job number or %string for command name match.',
        examples: [
            'fg                   - Foreground most recent job',
            'fg %1                - Foreground job number 1',
            'fg %sleep            - Foreground job matching "sleep"'
        ]
    },
    'bg': {
        description: 'Resume stopped job in background',
        usage: 'bg [%job_spec]',
        details: 'Resumes a stopped job in the background. Without arguments, resumes most recent stopped job. Only works on stopped jobs.',
        examples: [
            'bg                   - Resume most recent stopped job',
            'bg %1                - Resume job number 1',
            'jobs                 - Verify job is running'
        ]
    },
    'ps': {
        description: 'Report process status',
        usage: 'ps [-a] [-u] [-x]',
        details: 'Lists running processes. Use -a for all users, -u for user-oriented format, -x to include background. Shows PID, user, and command.',
        examples: [
            'ps                   - Show current processes',
            'ps -u                - User-oriented format',
            'ps -a                - Show all users',
            'ps -aux              - All options combined'
        ]
    },
    'kill': {
        description: 'Terminate or signal a process',
        usage: 'kill [-signal] <pid>',
        details: 'Sends a signal to a process. Default is SIGTERM (15). Use -9 or -KILL for force kill. Use -STOP to pause, -CONT to resume. Only kill your own processes (root can kill any).',
        examples: [
            'kill 1234            - Terminate process 1234 (SIGTERM)',
            'kill -9 1234         - Force kill process 1234',
            'kill -KILL 1234      - Same as -9',
            'kill -STOP 1234      - Stop (pause) process',
            'kill -CONT 1234      - Continue stopped process'
        ]
    },
    'export': {
        description: 'Set or display environment variables',
        usage: 'export [VARIABLE=value ...]',
        details: 'Sets environment variables that persist for the session. Without arguments, displays all exported variables. Variable names must start with a letter or underscore and contain only alphanumeric characters and underscores.',
        examples: [
            'export                      - Display all variables',
            'export MYVAR="hello"        - Set MYVAR',
            'export PATH="/usr/bin"      - Update PATH',
            'export DEBUG=1 VERBOSE=true - Set multiple variables',
            'echo $MYVAR                 - Use the variable'
        ]
    },
    'env': {
        description: 'Display environment variables',
        usage: 'env [-u VARIABLE]',
        details: 'Displays all environment variables in KEY=value format, sorted alphabetically. Use -u to unset a variable.',
        examples: [
            'env                         - Display all variables',
            'env -u DEBUG                - Unset DEBUG variable'
        ]
    },
    'umask': {
        description: 'Display or set file creation mask',
        usage: 'umask [mode]',
        details: 'Displays or sets the file creation mask (umask). The umask determines default permissions for new files and directories by subtracting from defaults. File default: 666 (rw-rw-rw-), Directory default: 777 (rwxrwxrwx). Actual permissions = default - umask. Common values: 022 (files: 644, dirs: 755), 077 (files: 600, dirs: 700), 002 (files: 664, dirs: 775).',
        examples: [
            'umask                       - Display current umask (e.g., 0022)',
            'umask 022                   - Set umask (files: 644, dirs: 755)',
            'umask 077                   - Restrictive (files: 600, dirs: 700)',
            'touch file && ls -l file    - See umask effect on new file',
            'mkdir dir && ls -ld dir     - See umask effect on new directory'
        ]
    },
    'stat': {
        description: 'Display detailed file information',
        usage: 'stat <file>',
        details: 'Shows comprehensive information about a file or directory including size, permissions in both octal and symbolic formats, owner, group (with UID/GID), and timestamps (Access, Modify, Change). Useful for inspecting file metadata and verifying permissions.',
        examples: [
            'stat file.txt               - Show detailed file information',
            'stat /home/user             - Show directory information',
            'stat secret.txt             - Check permissions and ownership',
            'stat program                - Verify SUID/SGID bits'
        ]
    },
    'locate': {
        description: 'Fast search for files by name',
        usage: 'locate [-i] [-b] <pattern>',
        details: 'Searches the entire filesystem for files matching a pattern. Much faster than find for name searches. Case-insensitive by default. Uses substring matching, not wildcards.',
        examples: [
            'locate README               - Find all files with "README" in path',
            'locate -i readme            - Case-insensitive search',
            'locate -b README.txt        - Match basename only',
            'locate .txt                 - Find all .txt files',
            'locate config               - Find all paths containing "config"'
        ]
    },
    'which': {
        description: 'Locate a command in PATH',
        usage: 'which <command> [command2 ...]',
        details: 'Shows the full path of executable commands by searching the directories in PATH. Returns the first match found. Useful for finding which version of a command will execute.',
        examples: [
            'which ls                    - Find location of ls command',
            'which python                - Find python executable',
            'which grep find cat         - Locate multiple commands',
            'which nonexistent           - No output for commands not found'
        ]
    },
    'whereis': {
        description: 'Locate binary, source, and manual pages',
        usage: 'whereis [-b] [-m] [-s] <command> [command2 ...]',
        details: 'Searches standard locations for binaries, man pages, and source files. Shows all matching locations, not just the first. Use -b for binaries only, -m for man pages only, -s for source only.',
        examples: [
            'whereis ls                  - Find ls binary and man page',
            'whereis -b gcc              - Find gcc binary only',
            'whereis -m chmod            - Find chmod manual pages only',
            'whereis grep find           - Locate multiple commands',
            'whereis python              - Find all python-related files'
        ]
    },
    'nano': {
        description: 'Simple text editor',
        usage: 'nano <file>',
        details: 'Opens a simple, user-friendly text editor for creating and modifying files. This is a simulator demonstration showing how nano works. Key commands: ^S (Ctrl+S) to save, ^X (Ctrl+X) to exit, ^K (Ctrl+K) to cut line, ^U (Ctrl+U) to paste.',
        examples: [
            'nano myfile.txt             - Edit or create file',
            'nano README.md              - Edit markdown file',
            'nano script.sh              - Create shell script',
            'nano                        - Show nano usage and help'
        ]
    },
    'sed': {
        description: 'Stream editor for transforming text',
        usage: 'sed <expression> <file>',
        details: 'Performs text transformations on files line-by-line. Supports substitution (s/old/new/), deletion (5d, /pattern/d), and printing (with -n flag). Use -e for multiple expressions. Expressions: s/pattern/replacement/[g] for substitution, Nd to delete line N, /pattern/d to delete matching lines, N,Mp with -n to print range.',
        examples: [
            'sed "s/old/new/" file.txt          - Replace first occurrence per line',
            'sed "s/old/new/g" file.txt         - Replace all occurrences',
            'sed "5d" file.txt                   - Delete line 5',
            'sed "/error/d" file.txt             - Delete lines with "error"',
            'sed -n "1,5p" file.txt              - Print lines 1-5 only',
            'sed -e "s/a/A/" -e "s/b/B/" file   - Multiple expressions'
        ]
    },
    'less': {
        description: 'View file contents with pagination',
        usage: 'less [-N] <file>',
        details: 'Displays file content page by page, allowing forward and backward navigation. Use -N to show line numbers. In a real terminal: Space for next page, b for previous page, /pattern to search, q to quit. This simulator shows the first page with instructions.',
        examples: [
            'less largefile.txt          - View file with pagination',
            'less -N code.js             - View with line numbers',
            'less README.md              - View documentation',
            'less /var/log/syslog        - View system logs'
        ]
    },
    'more': {
        description: 'Simple paginated file viewer',
        usage: 'more <file>',
        details: 'Displays file content one page at a time with percentage indicator. Simpler than less with forward-only navigation. In a real terminal: Space for next page, Enter for next line, q to quit. Shows progress as --More--(XX%). This simulator displays the first page.',
        examples: [
            'more document.txt           - View file page by page',
            'more README                 - View readme with pagination',
            'more /etc/passwd            - View user accounts',
            'more longfile.log           - View large log file'
        ]
    }
};

export const getCommandHelp = (command) => {
    return commandHelp[command] || null;
};
