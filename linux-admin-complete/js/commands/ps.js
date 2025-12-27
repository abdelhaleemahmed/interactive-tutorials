// js/commands/ps.js

import { getAllJobs } from '../jobControl.js';
import { getCurrentUser, getAllUsers } from '../userManagement.js';
import { validateArgs, hasFlag } from '../argumentValidator.js';

/**
 * ps command - Report process status
 * Usage: ps [-a] [-u] [-x]
 *
 * Options:
 *   -a    Show processes from all users
 *   -u    User-oriented format
 *   -x    Include processes without controlling terminals
 *
 * Common: ps, ps -a, ps -u, ps -aux
 */
export const psCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('ps', args);
    if (!validation.valid) {
        return validation.error;
    }

    const { flags } = validation;
    const currentUser = getCurrentUser();
    const showAll = hasFlag(flags, 'a');
    const userFormat = hasFlag(flags, 'u');
    const showAll2 = hasFlag(flags, 'x');

    // Build process list
    const processes = [];

    // System process (always present)
    processes.push({
        pid: 1,
        user: 'root',
        command: '/sbin/init'
    });

    // Current shell
    processes.push({
        pid: 100,
        user: currentUser.username,
        command: 'bash'
    });

    // Background jobs
    const jobs = getAllJobs();
    jobs.forEach(job => {
        if (job.status === "Running" || showAll || showAll2) {
            // Extract command name from full command line
            const cmdParts = job.command.split(' ');
            const cmdName = cmdParts[0];

            processes.push({
                pid: job.pid,
                user: currentUser.username,
                command: job.command,
                status: job.status
            });
        }
    });

    // Generate output
    let output = '';

    if (userFormat) {
        // User format header
        output += '  PID USER       COMMAND\n';
        processes.forEach(proc => {
            const pidStr = proc.pid.toString().padStart(5);
            const userStr = proc.user.padEnd(10);
            output += `${pidStr} ${userStr} ${proc.command}\n`;
        });
    } else {
        // Simple format header
        output += '  PID TTY      TIME CMD\n';
        processes.forEach(proc => {
            const pidStr = proc.pid.toString().padStart(5);
            const tty = 'pts/0';
            const time = '00:00:00';
            output += `${pidStr} ${tty.padEnd(8)} ${time} ${proc.command}\n`;
        });
    }

    return output.trim();
};
