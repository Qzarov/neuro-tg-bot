import { ObjectId } from "mongodb";
import { collections } from "../services/mongo.service";
import { UserState } from "../handlers/usersState";


export default class User {
    constructor(
        public tgId: number,
        public username?: string,
        public firstName?: string,
        public lastName?: string,
        public state?: UserState,
        public id?: ObjectId,
    ) {}

    async save() {
        const user = {
            tgId: this.tgId,
            username: this.username,
            firstName: this.firstName,
            lastName: this.lastName,
            state: this.state,
        }
        const result = await collections.users?.insertOne(user);
        console.log(`saving result:`, result)
    }

    async isInDatabase(): Promise<boolean> {
        const user = await collections.users?.findOne({ tgId: this.tgId });
        console.log(`find user:`, user)
        if (user?._id) {
            this.id = user._id
        }
        return user ? true : false
    }

    hasAccess(): boolean {
        return false
    }

    updateStatus() {

    }

    getStatus() {

    }
}