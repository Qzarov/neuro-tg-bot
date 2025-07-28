import { KnowledgeEntry } from '../domain/knowledge-entry.entity';

export interface KnowledgeEntryRepository {
  save(entry: KnowledgeEntry): Promise<void>;
  findById(id: KnowledgeEntryId): Promise<KnowledgeEntry | null>;
  searchByKeyword(keyword: string): Promise<KnowledgeEntry[]>;
}