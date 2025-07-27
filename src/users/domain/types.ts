/**
 * Roles description:
 *  - guest - can use only demo
 *  - user - has access to bot
 *  - admin - user rights + manage user's accesss and tokens, send messages to them
 *  - super - admin rights + grant/revoke admins rights
 */
export enum UserRole {
    guest = "guest",
    user = "user",
    admin = "admin",
    super = "super",
}

export enum UserState {
    start = "start",
    usingGPT = "usingGPT",
    usingGemini = "usingGemini",
    adminMode = "adminMode",
}

export interface BaseUserData {
    tgId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    state?: UserState;
    tokensUsed?: number;
    tokensAvailable?: number;
}

export type UserData = BaseUserData;


export type UpdateUserData = {
    username?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    state?: UserState;
    tokensUsed?: number;
    tokensAvailable?: number;
}