import { AddEntryCommand } from './add-entry.command';
import { KnowledgeEntry } from '../../domain/knowledge-entry.entity';
import { KnowledgeEntryRepository } from '../../infrastructure/knowledge-entry.repository';

export class AddEntryHandler {
  constructor(
    private readonly repository: KnowledgeEntryRepository,
    private readonly access: EntryAccessService
  ) {}

  async execute(command: AddEntryCommand): Promise<void> {
    if (!(await this.access.canCreate(command.userId))) {
      throw new Error('Недостаточно прав для добавления записи.');
    }

    const now = new Date();

    const entry = new KnowledgeEntry(
      command.question,
      command.answer,
      command.type,
      command.tags,
      command.userId,
      now,
      now
    );

    await this.repository.save(entry);
  }
}