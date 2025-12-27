// js/commands/kill.js

import {
    getJobByPid,
    removeJobByPid,
    updateJobStatusByPid
} from '../jobControl.js';
import { getCurrentUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * kill command - Terminate or signal a process
 * Usage: kill [-signal] pid
 *
 * Signals:
 *   -9, -KILL     SIGKILL (force kill)
 *   -15, -TERM    SIGTERM (graceful termination) [default]
 *   -STOP         SIGSTOP (stop/pause process)
 *   -CONT         SIGCONT (continue stopped process)
 */
export const killCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('kill', args);
    if (!validation.valid) {
        return validation.error;
    }

    const user = getCurrentUser();

    let signal = 'TERM';  // Default signal
    let pidArg = validation.nonFlags[0];

    // Parse signal if provided
    if (validation.flags.length > 0) {
        const signalArg = validation.flags[0].substring(1);

        // Map signal names and numbers
        if (signalArg === '9' || signalArg === 'KILL') {
            signal = 'KILL';
        } else if (signalArg === '15' || signalArg === 'TERM') {
            signal = 'TERM';
        } else if (signalArg === 'STOP') {
            signal = 'STOP';
        } else if (signalArg === 'CONT') {
            signal = 'CONT';
        }
        // Note: Invalid signals are already caught by validateArgs
    }

    // Parse PID
    const pid = parseInt(pidArg);
    if (isNaN(pid)) {
        return `kill: ${pidArg}: arguments must be process or job IDs`;
    }

    // Special PIDs that can't be killed
    if (pid === 1) {
        return `kill: (${pid}) - Operation not permitted`;
    }
    if (pid === 100) {
        return `kill: (${pid}) - Cannot kill current shell`;
    }

    // Find job by PID
    const job = getJobByPid(pid);
    if (!job) {
        return `kill: (${pid}) - No such process`;
    }

    // Permission check: only kill your own processes (root can kill any)
    // In our simulator, all background jobs belong to current user
    // So this check is simplified
    if (!user.isRoot) {
        // In a real system, we'd check job owner
        // For now, user can only kill their own jobs (which are all background jobs in our simulator)
    }

    // Apply signal
    if (signal === 'KILL' || signal === 'TERM') {
        // Terminate the job
        updateJobStatusByPid(pid, 'Terminated');

        // Cancel timeout if exists
        if (job.timeoutId) {
            clearTimeout(job.timeoutId);
        }

        return `[${job.jobId}]+ Terminated        ${job.command}`;
    } else if (signal === 'STOP') {
        // Stop the job
        updateJobStatusByPid(pid, 'Stopped');

        // Cancel timeout if exists
        if (job.timeoutId) {
            clearTimeout(job.timeoutId);
        }

        return `[${job.jobId}]+ Stopped           ${job.command}`;
    } else if (signal === 'CONT') {
        // Continue the job
        if (job.status === 'Stopped') {
            updateJobStatusByPid(pid, 'Running');
            return `[${job.jobId}]+ Running           ${job.command} &`;
        } else {
            return '';  // Already running, nothing to report
        }
    }

    return '';
};
