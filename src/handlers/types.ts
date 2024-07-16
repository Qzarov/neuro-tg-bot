import User from "../models/user";

export enum Commands {
    start = "/start",
    user = "/user",
    admin = "/admin",
    requestAccess = "/requestAccess",
    grantAccess = "/grantAccess",
    revokeAccess = "/revokeAccess",
    makeAdmin = "/makeAdmin",
    removeAdmin = "/removeAdmin",
    state = "/state",
    exitAdminMode = "/exitAdmin",
    userStats = "/userStats", // TODO add handler
    addTokens = "/addTokens", // TODO add handler
    takeTokens = "/takeTokens", // TODO add handler
    chooseNeuro = "Выбрать таролога",
    useGPT = "Расклад от GPT",
    useGemini = "Расклад от Gemini",
    endUsingNeuro = "Закончить расклад",
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

export type HasAccessParams = {
    userTo?: User;
    tokens?: number;
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
