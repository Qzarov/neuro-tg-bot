import { Collection, ObjectId } from "mongodb";

// export interface IBaseDbRepository {
//     get()
// }

export interface MongoGetParams {
    collection: string;
    where?: any;
    getOne?: boolean;
    skip?: number;
    limit?: number;
}

export default abstract class BaseEntity {    
    protected collection: Collection;

    constructor(collection: Collection) {
        this.collection = collection;
    }

    async findAll(where: any = {}): Promise<any[]> {
        const result = this.collection.find(where);
        return await result.toArray();
    }

    async create(entity: any): Promise<any> {
        return await this.collection.insertOne(entity);
    }

    async update(where: any, entity: any): Promise<any> {
        const result = await this.collection.updateOne({ where }, { $set: entity });
        return result;
    }

    async delete(where: any): Promise<any> {
        return await this.collection.deleteOne(where);
    }

    protected convertDocumentToEntity() {}
}