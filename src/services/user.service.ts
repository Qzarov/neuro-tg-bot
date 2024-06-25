import User, { UserData, UserRole, UserState } from "../models/user";
import DbEntityService from "./db.entity.service";
import { collections } from "./mongo.service";


export interface WhereUser {
    _id?: number;
    tgId?: number;
    username?: string;
    role?: UserRole;
    state?: UserState;
}

export default class UserService extends DbEntityService {

    constructor() {
        if (typeof collections.users !== 'undefined') {
            super(collections.users);
        } else {
            throw new Error(`⛔️  Cannot creater new user: Users collection is undefined`);
        }
    }

    async findAll(where: WhereUser): Promise<UserData[]> { // TODO Replace return type to Promise<User[]> {
        const result = await super.findAll(where);
        return result;
    }

    async findById(tgId: number): Promise<UserData> {
        const rawResult = await this.collection.findOne({ tgId: tgId });
        return rawResult as unknown as UserData;
    }

    async create(entity: UserData): Promise<any> {
        return await this.collection.insertOne(entity);
    }

    async update(where: WhereUser, entity: UserData): Promise<any> {
        const result = await this.collection.updateOne({ where }, { $set: entity });
        return result;
    }

    async findByUsername(username: string): Promise<UserData[]> {
        const usersData = await this.findAll({ username: username })
        return usersData
    }
}