import { ObjectId } from "mongodb";
import ApiTokenService from "../services/apiTokens.service";

export enum ApiTokenType {
    GPT = "gpt",
    ALL = "all",
};

interface BaseAPiTokenData {
    _id?: ObjectId;
    token?: string;
    type?: ApiTokenType;
    lastUsageTime?: number; // timestamp
    usages?: number; // number of usages
    isWorking?: boolean;
}

export type ApiTokenData = BaseAPiTokenData;

export default class ApiToken {
    protected _apiTokenService: ApiTokenService;

    constructor(protected _apiTokenData: ApiTokenData) {
        this._apiTokenService = new ApiTokenService();
    }

    getData(): ApiTokenData {
        return this._apiTokenData;
    }

    async update(data: ApiTokenData): Promise<void> {
        const res = await this._apiTokenService.update(
            { _id: this._apiTokenData._id }, 
            data
        );
    }

    async increaseUsages(): Promise<void> {
        // TODO implement
    }

    async setInvalid(): Promise<void> {
        // TODO implement
    }

    getLastUsed(type: ApiTokenType): void {
        // TODO implement
    }

    async create(data: ApiTokenData): Promise<any> {
        await this._apiTokenService.create(data);
    }

    async delete(): Promise<void> {
        if (typeof this._apiTokenData._id === 'undefined') {
            throw new Error('⛔️  ApiToken _id is undefined')
        }
        await this._apiTokenService.delete({
            _id: this._apiTokenData._id,
            token: this._apiTokenData.type,
        });
    }
}