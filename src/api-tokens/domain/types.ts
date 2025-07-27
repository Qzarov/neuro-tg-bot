import { ObjectId } from "mongodb";

export enum ApiTokenType {
    GPT = "gpt",
    ALL = "all",
};

interface BaseAPiTokenData {
    _id?: ObjectId;
    token?: string;
    type?: ApiTokenType;
    lastUsageTimestamp?: number; // timestamp
    usages?: number; // number of usages
    isWorking?: boolean;
}

export type ApiTokenData = BaseAPiTokenData;
export type UpdateApiTokenData = ApiTokenData;