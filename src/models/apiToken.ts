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
    lastUsageTimestamp?: number; // timestamp
    usages?: number; // number of usages
    isWorking?: boolean;
}

export type ApiTokenData = BaseAPiTokenData;
export type UpdateApiTokenData = ApiTokenData;

export default class ApiToken {
    protected _apiTokenService: ApiTokenService;

    constructor(protected _apiTokenType: ApiTokenType) {
        this._apiTokenService = new ApiTokenService();
    }

    async increaseUsages(token: string, currentUsages?: number): Promise<void> {
        await this._apiTokenService.update(
            { token: token },
            { 
                lastUsageTimestamp: (new Date()).getTime(),
                usages: (currentUsages?? 0) + 1, 
            }
        );        
    }

    async setInvalid(token: string): Promise<void> {
        await this._apiTokenService.update(
            { token: token },
            { isWorking: false }
        );
    }

    async getLastUsed() {
        const token = await this._apiTokenService.findMin(
            { type: this._apiTokenType, }
        )

        console.log('min token:', token)

        if (typeof token?.token === 'undefined') {
            throw new Error(`Get undefined token`);
        }
        await this.increaseUsages(token.token, token.usages);
        return token.token
    }

    async create(data: ApiTokenData): Promise<any> {
        await this._apiTokenService.create(data);
    }

    async delete(token: string): Promise<void> {
        await this._apiTokenService.delete({
            token: token,
        });
    }
}