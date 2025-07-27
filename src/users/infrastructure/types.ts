import { UserRole, UserState } from "../domain/types";

export interface WhereUser {
    _id?: number;
    tgId?: number;
    username?: string;
    role?: UserRole;
    state?: UserState;
}
