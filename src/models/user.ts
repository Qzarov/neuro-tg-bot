import { ObjectId } from "mongodb";
import { collections } from "../services/mongo.service";


export enum UserState {
    start,
    usingGPT,
    usingGemini,
    inAdminMode,
}

export default class User {
    constructor(
        public tgId: number,
        public username?: string,
        public firstName?: string,
        public lastName?: string,
        public state?: UserState,
        public id?: ObjectId,
        public isAdmin: boolean = false,
        public hasAccess: boolean = false,
    ) {}

    async save() {
        const user = {
            tgId: this.tgId,
            username: this.username,
            firstName: this.firstName,
            lastName: this.lastName,
            state: this.state,
            isAdmin: this.isAdmin,
            hasAccess: this.hasAccess,
        }
        const result = await collections.users?.insertOne(user);
        console.log(`saving result:`, result)
    }

    async isInDatabase(): Promise<boolean> {
        const user = await this.getDbRecord();
        if (user?._id) {
            this.id = user._id
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
            { tgId: this.tgId }, 
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
        const user = await collections.users?.findOne({ tgId: this.tgId });
        return user
    }
}