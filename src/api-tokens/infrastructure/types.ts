import { ApiTokenType } from "@api-tokens/domain";
import { ObjectId } from "mongodb";

export interface WhereApiToken {
    _id?: ObjectId;
    type?: ApiTokenType;
    token?: string;
    limit?: number;
}