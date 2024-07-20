import { ApiTokenType } from "../models/apiToken";
import User from "../models/user";

export enum Command {
    start = "/start",
    user = "/user", // TODO add handler
    admin = "/admin",
    requestAccess = "/requestAccess",
    grantAccess = "/grantAccess",
    revokeAccess = "/revokeAccess",
    makeAdmin = "/makeAdmin",
    removeAdmin = "/removeAdmin",
    state = "/state",
    exitAdminMode = "/exitAdmin",
    addTokens = "/addTokens",
    takeTokens = "/takeTokens",
    getApiTokens = "/getApiTokens",
    addApiToken = "/addApiToken",
    deleteApiToken = "/deleteApiToken",
    chooseNeuro = "Выбрать таролога",
    useGPT = "Расклад от GPT",
    useGemini = "Расклад от Gemini",
    endUsingNeuro = "Закончить расклад",
};

export type CommandParams = {
    username?: string;
    tokens?: number;
    apiTokenType?: ApiTokenType;
    apiToken?: string;
};

export type CommandWithParams = {
    command: Command;
    params?: CommandParams;
};

export enum CallbackData {
    translate = "translate", 
    approveAccess = "approveAccess",
    rejectAccess = "rejectAccess",
};

export enum AvailableNeuros {
    GPT,
    GEMINI // unsupported now
};

/**
 * Generally field `message` is used for an answer to user.
 * The field `updated` is set to true if the entity to which 
 *  the action was directed has been changed.
 */
export interface Result {
    result: boolean;
    message: string;
    updated?: boolean;
}

export interface HasAccessResult extends Result {};
/**
 * If result === true, userTo should be not undefined
 */
export interface UsernameValidationResult extends Result {
    userTo?: User;
}
