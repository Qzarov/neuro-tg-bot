import BaseDbRepository from "../../shared/domain/base.entity";
import { collections } from "@shared/infrastructure";
import { HistoryRecord, WhereHistoryRecord } from "./types";


export class HistoryService extends BaseDbRepository {

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