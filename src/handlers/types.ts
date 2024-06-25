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
};

export type HasAccessResult = {
    result: boolean;
    message: string;
}
