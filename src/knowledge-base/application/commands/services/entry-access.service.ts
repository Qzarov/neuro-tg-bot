import { UserRepository } from '@users/domain';

export class EntryAccessService {
  constructor(private readonly users: UserRepository) {}

  async canCreate(userId: string): Promise<boolean> {
    const user = await this.users.findById(userId);
    return user?.hasRole('admin') || user?.hasRole('editor');
  }
}