import { ApiTokenType } from "../models/apiToken";
import { Command, CommandWithParams } from "./types";

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
 * 2. With username as a parameter:
 * - /grantAccess   username
 * - /revokeAccess  username
 * - /makeAdmin     username
 * - /removeAdmin   username
 * 
 * 3. With apiTokenType as a parameter:
 * - /getApiTokens  apiTokenType
 * 
 * 4. With token as a parameter:
 * - /deleteApiToken  token
 * 
 * 5. With username and number of tokens:
 * - /addTokens username tokens
 * - /takeTokens username tokens
 * 
 * 6. With tokenType and token as parameters:
 * - /addApiToken apiTokenType token
 */
export default function parseStringCommand(command: string): CommandWithParams {
    /**
     * 1. Check commands without parameters
     */
    if ([
        String(Command.start), 
        String(Command.requestAccess),
        String(Command.admin),
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
    if (!splittedParams.length && command !== Command.getApiTokens) {
        throw new Error(`Command '${command}' doesn't contain parameters`)
    }

    /**
     * 2. Check commands with username as parameter
     */
    if ([
        String(Command.grantAccess), 
        String(Command.revokeAccess), 
        String(Command.makeAdmin),
        String(Command.removeAdmin),
    ].includes(extractedCommand)) {
        return { 
            command: extractedCommand as Command,
            params: { 
                username: splittedParams[0],
            },
        };
    }

    /**
     * 3. Check commands with tokenType as parameter
     */
    if ([
        String(Command.getApiTokens), 
    ].includes(extractedCommand)) {
        const tokenType: ApiTokenType = splittedParams.length == 1 
            ? splittedParams[0] as ApiTokenType 
            : ApiTokenType.ALL;
        return { 
            command: extractedCommand as Command,
            params: { 
                apiTokenType: tokenType,
            },
        };
    }

    /**
     * 4. Check commands with token as parameter
     */
    if ([
        String(Command.deleteApiToken), 
    ].includes(extractedCommand)) {
        return { 
            command: extractedCommand as Command,
            params: { 
                apiToken: splittedParams[0],
            },
        };
    }

    /**
     * Check number of the remaining parameters
     */
    if (splittedParams.length < 2) {
        throw new Error(`Command '${command}' doesn't contain enough parameters`)
    }

    /**
     * 5. Check commands with username and number of tokens as parameters
     */
    if ([
        String(Command.addTokens), 
        String(Command.takeTokens), 
    ].includes(extractedCommand)) {
        if (!Number.isInteger(parseInt(splittedParams[1]))) {
            throw new Error(`Error parsing tokens from '${command}': '${splittedParams[1]}' is not a number`)
        }
        return { 
            command: extractedCommand as Command,
            params: { 
                username: splittedParams[0],
                tokens: parseInt(splittedParams[1]),
            },
        };
    }
    
    /**
     * 6. Check commands with tokenType and apiToken as parameters
     */
    if ([
        String(Command.addApiToken), 
    ].includes(extractedCommand)) {
        return { 
            command: extractedCommand as Command,
            params: { 
                apiTokenType: splittedParams[0] as ApiTokenType,
                apiToken: splittedParams[1],
            },
        };
    }

    throw new Error(`Unknown command '${command}'`)
}
