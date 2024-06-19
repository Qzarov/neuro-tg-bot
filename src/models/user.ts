import { ObjectId, WithId } from "mongodb";
import { collections } from "../services/mongo.service";


export enum UserState {
    start,
    usingGPT,
    usingGemini,
    adminMode,
}

export interface BaseUserData {
    firstName?: string;
    lastName?: string;
    state?: UserState;
    id?: ObjectId;
    isAdmin?: boolean;
    hasAccess?: boolean;
    tokensUsed?: number;
    tokensAvailable?: number;
}

export interface UserDataWithTgId extends BaseUserData {
    tgId: number;
    username?: string;
}

export interface UserDataWithUsername extends BaseUserData {
    tgId?: number;
    username: string;
}

export type UserData = UserDataWithUsername | UserDataWithTgId;


export default class User {
    
    constructor(private _userData: UserData) {}

    async save() {
        const result = await collections.users?.insertOne(this._userData);
        console.log(`saving result:`, result)
    }

    async isInDatabase(): Promise<boolean> {
        const user = await this.getDbRecord();
        console.log(`get user from db:`, user)
        
        // if (user?._id) {
        //     this._userData = user
        // }
        return user ? true : false
    }

    async hasAdminRights(): Promise<boolean> {
        const user = await this.getDbRecord();
        return user?.isAdmin ? true : false
    }

    async grantAccess(){}

    async hasAccessToBot(): Promise<boolean> {
        const user = await this.getDbRecord();
        return user?.hasAccess
    }

    async updateState(newState: UserState) {
        const res = await collections.users?.updateOne(
            { tgId: this._userData.tgId }, 
            {$set: {state: newState}}
        );
        console.log(`updateState result set state`, newState)
    }

    public async isUsingNeuro(): Promise<boolean> {
        const userState = await this.getState()
        return [
            UserState.usingGPT, 
            UserState.usingGemini
        ].includes(userState)
    }

    async getState(): Promise<UserState> {
        const user = await this.getDbRecord()
        return user?.state
    }

    /**
     * Use this function instead of getDbRecord()
     * @returns Promise<UserData>
     */
    async getUserDataFromDb(): Promise<UserData> {
        const rawUser = await this.getDbRecord()

        const userData: UserData = {
            tgId: rawUser?.tgId,
            username: rawUser?.username,
            firstName: rawUser?.firstName,
            lastName: rawUser?.lastName,
            state: rawUser?.state,
            id: rawUser?._id,
            isAdmin: rawUser?.isAdmin,
            hasAccess: rawUser?.hasAccess,
            tokensUsed: rawUser?.tokensUsed,
            tokensAvailable: rawUser?.tokensAvailable,
        }

        return userData
    }

    private async getDbRecord() {
        const user = await collections.users?.findOne({ 
            tgId: this._userData.tgId, 
            username: this._userData.username, 
        });
        return user
    }
}