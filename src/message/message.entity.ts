import { collections } from "../services/mongo.service";
import MessageService, { WhereMessage } from "./message.repository";

export enum MessageType {
  unknown = "unknown",
  command = "command",
  question = "question",
  statement = "statement",
}

export interface MessageData {
  chatId: number;
  fromGroup: boolean;
  tgIdFrom: number;
  text: string;
  summary?: string;
  important: boolean;
  type: MessageType;
}

export default class MessageEntity {
  protected _messageService: MessageService;

  constructor(protected _messageData: MessageData) {
      this._messageService = new MessageService();
  }

  async save(): Promise<MessageData> {
      return await this._messageService.create(this._messageData)
  }

  async findAll(where: WhereMessage): Promise<MessageData[]> {
      return await this._messageService.findAll(where)
  }
}