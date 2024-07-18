import { CommandParams, Command, CommandWithParams } from "./types";

/**
 * Parses a command and returns Command and parameters
 * Handles following commands:
 * 1. Without parameters:
 * - /start
 * - /requestAccess
 * - /userStats
 * - /exitAdmin
 * - /state
 * - "Выбрать таролога"
 * - "Расклад от GPT"
 * - "Расклад от Gemini"
 * - "Закончить расклад"
 * 
 * 2. With one parameter:
 * - /grantAccess   username
 * - /revokeAccess  username
 * - /makeAdmin     username
 * - /removeAdmin   username
 */
export default function parseStringCommand(command: string): CommandWithParams {
    console.log(`parse command:`, command);
    /**
     * Check commands without parameters
     */
    if ([
        String(Command.start), 
        String(Command.requestAccess),
        String(Command.userStats),
        String(Command.exitAdminMode),
        String(Command.state),
        String(Command.chooseNeuro), 
        String(Command.useGPT), 
        String(Command.useGemini),
        String(Command.endUsingNeuro),
    ].includes(command)) {
        const convertedCommand: Command = command as Command; 
        return { 
            command: convertedCommand
        };
    }

    /**
     * Separate command and parameters
     */
    const splittedParams = command.split(' ');
    const extractedCommand = splittedParams.shift();
    
    if (typeof extractedCommand === 'undefined') {
        throw new Error(`Error parsing '${command}': undefined after shifting`)
    }
    if (!splittedParams.length) {
        throw new Error(`Command '${command}' doesn't contain parameters`)
    }

    /**
     * Check commands with username as parameter
     */
    if ([
        String(Command.grantAccess), 
        String(Command.revokeAccess), 
        String(Command.makeAdmin),
        String(Command.removeAdmin),
    ].includes(extractedCommand)) {
        console.log('Command with one parameter');
        return { 
            command: extractedCommand as Command,
            params: { 
                username: splittedParams[0],
            },
        };
    }

    /**
     * Split the remaining parameters
     */
    if (splittedParams.length < 2) {
        console.log(`params:`, splittedParams)
        throw new Error(`Command '${command}' doesn't contain enough parameters`)
    }

    /**
     * Check commands with username and tokens as parameter
     */
    if ([
        String(Command.addTokens), 
        String(Command.takeTokens), 
    ].includes(extractedCommand)) {
        console.log('Command with two parameters');
        return { 
            command: extractedCommand as Command,
            params: { 
                username: splittedParams[0],
                tokens: parseInt(splittedParams[1]),
            },
        };
    }
    
    throw new Error(`Unknown command '${command}'`)
}
