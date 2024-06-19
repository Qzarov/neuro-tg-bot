import { ObjectId } from "mongodb";
import { collections } from "../services/mongo.service";


export enum UserState {
    start,
    usingGPT,
    usingGemini,
    adminMode,
}

export interface UserData {
    tgId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    state?: UserState;
    id?: ObjectId;
    isAdmin?: boolean;
    hasAccess?: boolean;
    tokensUsed?: number;
    tokensAvailable?: number;
}

export default class User {
    
    constructor(private _userData: UserData) {}

    async save() {
        const result = await collections.users?.insertOne(this._userData);
        console.log(`saving result:`, result)
    }

    async isInDatabase(): Promise<boolean> {
        const user = await this.getDbRecord();
        if (user?._id) {
            this._userData.id = user._id
        }
        return user ? true : false
    }

    async hasAdminRights(): Promise<boolean> {
        const user = await this.getDbRecord();
        console.log(`getIsAdmin for user:`, user)
        return user?.isAdmin ? true : false
    }

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
        console.log(`getState for user:`, user)
        return user?.state
    }

    private async getDbRecord() {
        const user = await collections.users?.findOne({ tgId: this._userData.tgId });
        return user
    }
}