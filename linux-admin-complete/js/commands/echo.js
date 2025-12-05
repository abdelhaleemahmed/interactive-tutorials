// js/commands/echo.js

export const echoCommand = (args) => {
    // If no arguments, return empty line
    if (args.length === 0) {
        return '';
    }

    // Join all arguments with spaces and return
    return args.join(' ');
};
