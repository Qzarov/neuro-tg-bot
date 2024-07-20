import { ObjectId } from "mongodb";
import { ApiTokenData, ApiTokenType } from "../models/apiToken";
import DbEntityService from "./db.entity.service";
import { collections } from "./mongo.service";


export interface WhereApiToken {
    _id?: ObjectId;
    type?: ApiTokenType;
    token?: string;
}

export default class ApiTokenService extends DbEntityService {

    constructor() {
        if (typeof collections.apiTokens !== 'undefined') {
            super(collections.apiTokens);
        } else {
            throw new Error(`⛔️  Cannot creater new api token: apiTokens collection is undefined`);
        }
    }

    async findAll(where?: WhereApiToken): Promise<ApiTokenData[]> { // TODO Replace return type to Promise<User[]> {
        const result = await super.findAll(where);
        return result;
    }

    async create(entity: ApiTokenData): Promise<any> {
        return await this.collection.insertOne(entity);
    }

    async update(where: WhereApiToken, entity: ApiTokenData): Promise<any> {
        const result = await this.collection.updateOne(where, { $set: entity });
        return result;
    }

    async delete(where: WhereApiToken): Promise<any> {
        return await this.collection.deleteOne(where);
    }
}