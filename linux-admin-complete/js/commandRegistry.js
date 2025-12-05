
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

import { user, getCurrentDateFormatted } from './terminalUtils.js';
import { getCurrentUser } from './userManagement.js';
import { commandHelp } from './commandHelp.js';

const helpCommand = (args) => {
    if (args.length === 0) {
        // Show general help
        return `Supported commands:\r\n` +
               `\r\nFile & Directory Operations:\r\n` +
               `  ls [-l]         - List directory contents. Use -l for long format.\r\n` +
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
               `\r\nFile Search:\r\n` +
               `  find <path> -name <pat> - Find files by name.\r\n` +
               `\r\nUser Management:\r\n` +
               `  su [user]       - Switch to another user (default: root).\r\n` +
               `\r\nOther:\r\n` +
               `  whoami          - Print the effective user ID.\r\n` +
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

export const commandHandlers = (termInstance) => ({
    'ls': lsCommand,
    'cd': cdCommand,
    'pwd': pwdCommand,
    'cat': catCommand,
    'echo': echoCommand,
    'mkdir': mkdirCommand,
    'rmdir': rmdirCommand,
    'touch': touchCommand,
    'rm': rmCommand,
    'mv': mvCommand,
    'cp': cpCommand,
    'grep': grepCommand,
    'find': findCommand,
    'head': headCommand,
    'tail': tailCommand,
    'sort': sortCommand,
    'uniq': uniqCommand,
    'wc': wcCommand,
    'chmod': chmodCommand,
    'chown': chownCommand,
    'su': suCommand,
    'help': (args) => helpCommand(args),
    'clear': () => clearCommand(termInstance),
    'whoami': whoamiCommand,
    'date': dateCommand,
});
