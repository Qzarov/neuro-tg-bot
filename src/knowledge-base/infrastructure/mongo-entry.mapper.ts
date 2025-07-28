import { KnowledgeEntry } from '../domain/knowledge-entry.entity';

export const entryMapper = {
  toPersistence(entry: KnowledgeEntry) {
    return {
      question: entry.question,
      answer: entry.answer,
      type: entry.type,
      tags: entry.tags,
      createdBy: entry.createdBy,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  },

  toDomain(raw: any): KnowledgeEntry {
    return new KnowledgeEntry(
      raw.question,
      raw.answer,
      raw.type,
      raw.tags,
      raw.createdBy,
      new Date(raw.createdAt),
      new Date(raw.updatedAt)
    );
  },
};