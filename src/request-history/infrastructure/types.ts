import { AvailableNeuros } from "@infrastructure/ai";
import { UserRole } from "@users/domain";
import { ObjectId } from "mongodb";


export type HistoryRecord = {
  _id?: ObjectId,
  userId?: number,
  data: RoleChangedData | NeuroRequestedData | TokensChangedData,
  type: HistoryRecordType,
};

export type RoleChangedData = {
  userToId: number,
  userToOldRole: UserRole,
  userToNewRole: UserRole,
};

export type NeuroRequestedData = {
  neuro: AvailableNeuros,
  requestText: string,
  neuroAnswer: string,
  tokensUsed: number,
};

export type TokensChangedData = {
  userToId: number,
  tokens: number,
};

export type WhereHistoryRecord = {
  userId: number,
  type?: HistoryRecordType,
  dataFrom?: number,
  dataTo?: number,
};

export enum HistoryRecordType {
  ROLE_CHANGED = "ROLE_CHANGED",
  NEURO_REQUESTED = "NEURO_REQUESTED",
  TOKENS_CHANGED = "TOKENS_CHANGED",
}