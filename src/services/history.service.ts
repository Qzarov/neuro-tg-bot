import { ObjectId } from "mongodb";
import DbEntityService from "./db.entity.service";
import { collections } from "./mongo.service";
import { UserRole } from "../models/user.entity";
import { AvailableNeuros } from "../handlers/types";

export type HistoryRecord = {
    _id?: ObjectId,
    userId?: number,
    data: RoleChangedData | NeuroRequestedData | TokensChangedData,
    type: HistoryRecordType,
};

export type RoleChangedData = {
    userToId: number,
    userToOldRole: UserRole,
    userToNewRole: UserRole,
};

export type NeuroRequestedData = {
    neuro: AvailableNeuros,
    requestText: string,
    neuroAnswer: string,
    tokensUsed: number,
};

export type TokensChangedData = {
    userToId: number,
    tokens: number,
};

export type WhereHistoryRecord = {
    userId: number,
    type?: HistoryRecordType,
    dataFrom?: number,
    dataTo?: number,
};

export enum HistoryRecordType {
    ROLE_CHANGED = "ROLE_CHANGED",
    NEURO_REQUESTED = "NEURO_REQUESTED",
    TOKENS_CHANGED = "TOKENS_CHANGED",
}

export default class HistoryService extends DbEntityService {

    constructor() {
        if (typeof collections.history !== 'undefined') {
            super(collections.history);
        } else {
            throw new Error(`⛔️  Cannot create HistoryService: history collection is undefined`);
        }
    }

    async findAll(where?: WhereHistoryRecord): Promise<HistoryRecord[]> {
        const result = await super.findAll(where);
        return result;
    }

    async create(entity: HistoryRecord): Promise<any> {
        return await this.collection.insertOne(entity);
    }
}