import { UserData, UserRole, UserState } from "../models/user";
import DbEntityService from "./db.entity.service";


export interface WhereUser {
    _id?: number;
    role?: UserRole;
    state?: UserState;
}

export default class UserService extends DbEntityService {

    async findAll(where: WhereUser): Promise<UserData[]> { // User[] {
        const result = await super.findAll(where);
        return result;
    }

    async findById(tgId: number): Promise<any> {
        return await this.collection.findOne({ tgId: tgId });
    }
}