import { ObjectId } from "mongodb";
import { ApiTokenData, ApiTokenType, UpdateApiTokenData } from "../models/apiToken";
import DbEntityService from "./db.entity.service";
import { collections } from "./mongo.service";


export interface WhereApiToken {
    _id?: ObjectId;
    type?: ApiTokenType;
    token?: string;
    limit?: number;
}

export default class ApiTokenService extends DbEntityService {

    constructor() {
        if (typeof collections.apiTokens !== 'undefined') {
            super(collections.apiTokens);
        } else {
            throw new Error(`⛔️  Cannot create new api token: apiTokens collection is undefined`);
        }
    }

    async findAll(where?: WhereApiToken): Promise<ApiTokenData[]> {
        const result = await super.findAll(where);
        return result;
    }

    async findMin(where?: WhereApiToken): Promise<ApiTokenData> {
        if (typeof where?.type === 'undefined') {
            throw new Error(`Cannot find last used api token: type is required`);
        }

        const tokens = await super.findAll({ type: where?.type, });

        const lastUsed: ApiTokenData = tokens.reduce(
            (rToken: ApiTokenData, lToken: ApiTokenData) => { 
                return (rToken.lastUsageTimestamp?? 0) < (lToken.lastUsageTimestamp?? 0) ? rToken : lToken;
            }
        );
        return lastUsed
    }

    async create(entity: ApiTokenData): Promise<any> {
        return await this.collection.insertOne(entity);
    }

    async update(where: WhereApiToken, entity: UpdateApiTokenData): Promise<any> {
        const result = await this.collection.updateOne(where, { $set: entity });
        return result;
    }

    async delete(where: WhereApiToken): Promise<any> {
        return await this.collection.deleteOne(where);
    }
}