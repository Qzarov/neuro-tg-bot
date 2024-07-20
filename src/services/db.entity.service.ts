import { Collection, ObjectId } from "mongodb";

// export interface IDbEntityService {
//     get()
// }

export interface MongoGetParams {
    collection: string;
    where?: any;
    getOne?: boolean;
    skip?: number;
    limit?: number;
}

export default abstract class DbEntityService {    
    protected collection: Collection;

    constructor(collection: Collection) {
        this.collection = collection;
    }

    async findAll(where: any = {}): Promise<any[]> {
        const query = this.collection.find(where);
        if (where.getOne) {
            return await query.limit(1).toArray();
        } else {
            return await query.toArray();
        }
    }

    async findById(id: number): Promise<any> {
        return await this.collection.findOne({ _id: new ObjectId(id) });
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