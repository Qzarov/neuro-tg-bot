import { KnowledgeEntryRepository } from './knowledge-entry.repository';
import { KnowledgeEntry } from '../domain/knowledge-entry.entity';
import { BaseDbRepository } from '@shared/domain';
import { collections } from '@shared/infrastructure';
import { ObjectId } from "mongodb";
import { entryMapper } from './mongo-entry.mapper';

export class MongoKnowledgeEntryRepository extends BaseDbRepository implements KnowledgeEntryRepository {
  constructor() {
      if (typeof collections.users !== 'undefined') {
          super(collections.users);
      } else {
          throw new Error(`⛔️  Cannot creater new user record: Users collection is undefined`);
      }
  }

  async save(entry: KnowledgeEntry): Promise<void> {
    const data = entryMapper.toPersistence(entry);
    await this.collection.updateOne(
      { $set: data },
      { upsert: true }
    );
  }

  async findById(id: ObjectId): Promise<KnowledgeEntry | null> {
    const raw = await this.collection.findOne({ _id: id });
    return raw ? entryMapper.toDomain(raw) : null;
  }

  async searchByKeyword(keyword: string): Promise<KnowledgeEntry[]> {
    const cursor = this.collection.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { answer: { $regex: keyword, $options: 'i' } },
        { tags: keyword },
      ],
    });

    const results = await cursor.toArray();
    return results.map(entryMapper.toDomain);
  }
}