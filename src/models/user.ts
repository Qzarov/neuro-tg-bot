import { collections } from "../services/mongo.service";
import { UserService } from "../services";

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

export default class User {
    protected _userService: UserService;

    constructor(protected _userData: UserData) {
        this._userService = new UserService();
    }

    getTgId(): number { 
        if (this._userData.tgId) {
            return this._userData.tgId; 
        } else {
            throw new Error(`User ${this._userData.username} has undefined tgId: ${this._userData.tgId}`);
        }
    }

    getData(): UserData {
        return this._userData;
    }

    /**
     *  If the user data is found in the database, the method sets the _userData 
     * property of the User instance to the fetched user data. 
     * 
     * If the user data is not found in the database, the method saves the user data 
     * to the database using the save method.
     */
    async isInDatabase(): Promise<boolean> {
        const user = await this.getUserDataFromDb();

        if (!user.tgId) {
            this._userData.role = UserRole.guest;
            this._userData.state = UserState.start;
            this._userData.tokensAvailable = 0;
            this._userData.tokensUsed = 0;

            await this._userService.create(this._userData)
        } else {
            this._userData = user;
        }
        return typeof user.tgId === 'undefined';
    }

    hasAdminRights(): boolean {
        const role = this._userData.role ?? UserRole.guest;
        return [UserRole.admin, UserRole.super].includes(role);
    }

    async update(data: UpdateUserData) {
        const res = await collections.users?.updateOne(
            { tgId: this._userData.tgId }, 
            { $set: data }
        );
    }

    hasAccessToBot(): boolean {
        const role = this._userData.role ?? UserRole.guest;
        return [UserRole.user, UserRole.admin, UserRole.super].includes(role);
    }

    isUsingNeuro(): boolean {
        const userState = this.getState()
        return [
            UserState.usingGPT, 
            UserState.usingGemini
        ].includes(userState)
    }

    getState(): UserState {
        return this._userData.state ?? UserState.start;
    }

    async getRole(): Promise<UserRole> {
        return this._userData.role ?? UserRole.guest;
    }

    /**
     * Use this function instead of getDbRecord()
     * @returns Promise<UserData>
     */
    protected async getUserDataFromDb(): Promise<UserData> {
        const rawUser = await this.getDbRecord()

        const userData: UserData = {
            tgId: rawUser?.tgId,
            username: rawUser?.username,
            firstName: rawUser?.firstName,
            lastName: rawUser?.lastName,
            role: typeof rawUser?.role !== 'undefined' ? rawUser.role : UserRole.guest,
            state: typeof rawUser?.state !== 'undefined' ? rawUser.state : UserState.start,
            tokensUsed: rawUser?.tokensUsed ?? 0,
            tokensAvailable: rawUser?.tokensAvailable ?? 0,
        }
        return userData
    }

    // TODO use _userService instead
    protected async getDbRecord() {
        const user = await this._userService.findById(this._userData.tgId);
        return user
    }
}