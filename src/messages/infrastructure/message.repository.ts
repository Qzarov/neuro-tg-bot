import { MessageData } from "@message/domain";
import { BaseEntity, collections } from "@shared/index";

export interface WhereMessage {
  _id?: number;
  chatId?: number;
  fromDate?: Date;
  toDate?: Date;
  substring?: string;
}

export class MessageRepository extends BaseEntity {
    constructor() {
        if (typeof collections.messages !== 'undefined') {
            super(collections.messages);
        } else {
            throw new Error(`⛔️  Cannot create new message record: Messages collection is undefined`);
        }
    }

    async findAll(where: WhereMessage): Promise<MessageData[]> {
        const result = await super.findAll(where);
        return result;
    }

    async findById(tgId: number): Promise<MessageData> {
        const rawResult = await this.collection.findOne({ tgId: tgId });
        return rawResult as unknown as MessageData;
    }

    async create(entity: MessageData): Promise<any> {
        return await this.collection.insertOne(entity);
    }

    async update(where: WhereMessage, entity: MessageData): Promise<any> {
        const result = await this.collection.updateOne({ where }, { $set: entity });
        return result;
    }
}