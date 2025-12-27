
// js/commandRegistry.js

import { lsCommand } from './commands/ls.js';
import { cdCommand } from './commands/cd.js';
import { mkdirCommand } from './commands/mkdir.js';
import { pwdCommand } from './commands/pwd.js';
import { catCommand } from './commands/cat.js';
import { rmdirCommand } from './commands/rmdir.js';
import { touchCommand } from './commands/touch.js';
import { rmCommand } from './commands/rm.js';
import { mvCommand } from './commands/mv.js';
import { cpCommand } from './commands/cp.js';
import { echoCommand } from './commands/echo.js';
import { grepCommand } from './commands/grep.js';
import { findCommand } from './commands/find.js';
import { headCommand } from './commands/head.js';
import { tailCommand } from './commands/tail.js';
import { sortCommand } from './commands/sort.js';
import { uniqCommand } from './commands/uniq.js';
import { wcCommand } from './commands/wc.js';
import { chmodCommand } from './commands/chmod.js';
import { chownCommand } from './commands/chown.js';
import { suCommand } from './commands/su.js';
import { sleepCommand } from './commands/sleep.js';
import { jobsCommand } from './commands/jobs.js';
import { fgCommand } from './commands/fg.js';
import { bgCommand } from './commands/bg.js';
import { psCommand } from './commands/ps.js';
import { killCommand } from './commands/kill.js';
import { exportCommand } from './commands/export.js';
import { envCommand } from './commands/env.js';
import { umaskCommand } from './commands/umask.js';
import { statCommand } from './commands/stat.js';
import { locateCommand } from './commands/locate.js';
import { whichCommand } from './commands/which.js';
import { whereisCommand } from './commands/whereis.js';
import { nanoCommand } from './commands/nano.js';
import { sedCommand } from './commands/sed.js';
import { lessCommand } from './commands/less.js';
import { manCommand } from './commands/man.js';
import { moreCommand } from './commands/more.js';
import { resetCommand, scheduleReload } from './commands/reset.js';
import { historyCommand } from './commands/history.js';
import { progressCommand } from './commands/progress.js';
import { searchCommand } from './commands/search.js';
import { idCommand } from './commands/id.js';
import { groupsCommand } from './commands/groups.js';
import { sudoCommand } from './commands/sudo.js';
import { groupaddCommand } from './commands/groupadd.js';
import { useraddCommand } from './commands/useradd.js';
import { usermodCommand } from './commands/usermod.js';

import { user, getCurrentDateFormatted, triggerFilesystemSave } from './terminalUtils.js';
import { getProgressTracker } from './progressTracking.js';
import { getCurrentUser } from './userManagement.js';
import { commandHelp } from './commandHelp.js';

/**
 * Wrapper for commands that modify the filesystem
 * Automatically triggers save after execution and tracks file creation
 */
const withFilesystemSave = (commandFn, tracksFileCreation = false) => {
    return (...args) => {
        const result = commandFn(...args);
        triggerFilesystemSave();

        // Track file creation for progress
        if (tracksFileCreation && !result.includes('error') && !result.includes('cannot') && result.length < 100) {
            try {
                const tracker = getProgressTracker();
                tracker.incrementFileCount();
            } catch (e) {
                // Silently fail if tracker not available
            }
        }

        return result;
    };
};

const helpCommand = (args) => {
    if (args.length === 0) {
        // Show general help
        return `Supported commands:\r\n` +
               `\r\nFile & Directory Operations:\r\n` +
               `  ls [-l] [-R]    - List directory contents. Use -l for long format, -R for recursive.\r\n` +
               `  cd <dir>        - Change the current directory.\r\n` +
               `  pwd             - Print name of current working directory.\r\n` +
               `  mkdir <dir>     - Make directories.\r\n` +
               `  rmdir <dir>     - Remove empty directories.\r\n` +
               `  touch <file>    - Change file timestamps or create new files.\r\n` +
               `  rm <file>       - Remove files.\r\n` +
               `  mv <src> <dest> - Move or rename files or directories.\r\n` +
               `  cp <src> <dest> - Copy files.\r\n` +
               `\r\nPermissions:\r\n` +
               `  chmod <mode> <file> - Change file permissions (octal mode: 755, 644, etc).\r\n` +
               `  chown <user>:<group> <file> - Change file ownership (root only).\r\n` +
               `\r\nText Processing:\r\n` +
               `  cat <file>      - Concatenate and print files.\r\n` +
               `  echo <text>     - Print text to the terminal.\r\n` +
               `  grep <pat> <f>  - Search for pattern in file.\r\n` +
               `  head <file>     - Show first 10 lines of file.\r\n` +
               `  tail <file>     - Show last 10 lines of file.\r\n` +
               `  sort <file>     - Sort file contents.\r\n` +
               `  uniq <file>     - Remove duplicate lines.\r\n` +
               `  wc <file>       - Count lines, words, and bytes.\r\n` +
               `  sed <expr> <f>  - Stream editor for transforming text.\r\n` +
               `\r\nText Editors & Viewers:\r\n` +
               `  nano <file>     - Simple text editor.\r\n` +
               `  less <file>     - View file with pagination.\r\n` +
               `  more <file>     - Simple paginated file viewer.\r\n` +
               `\r\nFile Search:\r\n` +
               `  find <path> [-type f|d] [-name <pat>] [-size +N|-N] - Search for files.\r\n` +
               `  locate <pattern>        - Fast search for files by name.\r\n` +
               `  which <command>         - Locate a command in PATH.\r\n` +
               `  whereis <command>       - Locate binary, source, and manual pages.\r\n` +
               `\r\nUser & Group Management:\r\n` +
               `  whoami          - Print the effective user ID.\r\n` +
               `  id [user]       - Print user and group information.\r\n` +
               `  groups [user]   - Print group memberships.\r\n` +
               `  su [user]       - Switch to another user (default: root).\r\n` +
               `  sudo <command>  - Execute a command as root.\r\n` +
               `  groupadd <grp>  - Create a new group (requires root).\r\n` +
               `  useradd [-m] <user> - Create a new user (requires root).\r\n` +
               `  usermod -aG <grp> <user> - Add user to group (requires root).\r\n` +
               `\r\nProcess & Job Control:\r\n` +
               `  sleep <sec>     - Delay for specified time.\r\n` +
               `  jobs [-l|-r|-s] - List background jobs.\r\n` +
               `  fg [%job]       - Bring job to foreground.\r\n` +
               `  bg [%job]       - Resume job in background.\r\n` +
               `  ps [-aux]       - Report process status.\r\n` +
               `  kill [-sig] pid - Terminate or signal a process.\r\n` +
               `  command &       - Run command in background.\r\n` +
               `\r\nEnvironment Variables:\r\n` +
               `  export VAR=val  - Set environment variable.\r\n` +
               `  env             - Display all environment variables.\r\n` +
               `  echo $VAR       - Expand and print variable.\r\n` +
               `\r\nAdvanced Permissions:\r\n` +
               `  umask [mode]    - Display or set file creation mask.\r\n` +
               `  stat <file>     - Display detailed file information.\r\n` +
               `  chmod 4755 file - Set SUID/SGID/sticky bits (4-digit octal).\r\n` +
               `\r\nOther:\r\n` +
               `  man <cmd>       - Display manual page for command.\r\n` +
               `  search <query>  - Search for commands by keyword or description.\r\n` +
               `  history [n|-c]  - Display or manipulate command history. Use !!, !n, !-n for shortcuts.\r\n` +
               `  progress [-a]   - View your learning progress and achievements.\r\n` +
               `  reset [--info|--confirm] - Reset filesystem to default (use --info for details).\r\n` +
               `  date            - Display the current date and time.\r\n` +
               `  clear           - Clear the terminal screen.\r\n` +
               `  help [cmd]      - Display help. Use 'help <command>' for details.\r\n`;
    } else {
        // Show help for specific command
        const cmdName = args[0];
        const help = commandHelp[cmdName];

        if (!help) {
            return `help: no help found for '${cmdName}'`;
        }

        let output = `\r\n${cmdName.toUpperCase()}\r\n`;
        output += `${'='.repeat(cmdName.length)}\r\n\r\n`;
        output += `Description: ${help.description}\r\n`;
        output += `Usage: ${help.usage}\r\n\r\n`;
        output += `${help.details}\r\n\r\n`;
        output += `Examples:\r\n`;
        help.examples.forEach(example => {
            output += `  ${example}\r\n`;
        });

        return output;
    }
};

const clearCommand = (termInstance) => {
    termInstance.clear();
    return '';
};

const whoamiCommand = () => {
    return getCurrentUser().username;
};

const dateCommand = () => {
    return getCurrentDateFormatted();
};

export const commandHandlers = (termInstance, historyManager = null) => {
    const handlers = {
        'ls': lsCommand,
        'cd': cdCommand,
        'pwd': pwdCommand,
        'cat': catCommand,
        'echo': withFilesystemSave(echoCommand, true),  // Can redirect to files
        'mkdir': withFilesystemSave(mkdirCommand, true),
        'rmdir': withFilesystemSave(rmdirCommand),
        'touch': withFilesystemSave(touchCommand, true),
        'rm': withFilesystemSave(rmCommand),
        'mv': withFilesystemSave(mvCommand),
        'cp': withFilesystemSave(cpCommand, true),
        'grep': grepCommand,
        'find': findCommand,
        'head': headCommand,
        'tail': tailCommand,
        'sort': sortCommand,
        'uniq': uniqCommand,
        'wc': wcCommand,
        'chmod': withFilesystemSave(chmodCommand),
        'chown': withFilesystemSave(chownCommand),
        'su': suCommand,
        'sleep': sleepCommand,
        'jobs': jobsCommand,
        'fg': fgCommand,
        'bg': bgCommand,
        'ps': psCommand,
        'kill': killCommand,
        'export': exportCommand,
        'env': envCommand,
        'umask': umaskCommand,
        'stat': statCommand,
        'locate': locateCommand,
        'which': whichCommand,
        'whereis': whereisCommand,
        'nano': nanoCommand,
        'sed': sedCommand,
        'less': lessCommand,
        'more': moreCommand,
        'man': manCommand,
        'help': (args) => helpCommand(args),
        'clear': () => clearCommand(termInstance),
        'reset': (args) => {
            const output = resetCommand(args);
            // Schedule reload if reset was confirmed
            if (args.includes('--confirm')) {
                scheduleReload();
            }
            return output;
        },
        'history': (args) => historyCommand(args, historyManager),
        'progress': progressCommand,
        'search': searchCommand,
        'whoami': whoamiCommand,
        'id': idCommand,
        'groups': groupsCommand,
        'sudo': (args) => sudoCommand(args, handlers),
        'groupadd': withFilesystemSave(groupaddCommand),
        'useradd': withFilesystemSave(useraddCommand),
        'usermod': withFilesystemSave(usermodCommand),
        'date': dateCommand,
    };
    return handlers;
};
