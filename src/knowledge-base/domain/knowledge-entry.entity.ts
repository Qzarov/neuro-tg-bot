import { QuestionTypes } from "./types";


export class KnowledgeEntry {
  constructor(
    private _question: string,
    private _answer: string,
    private _type: QuestionTypes,
    private _tags: string[],
    public readonly createdBy: string, // user ID
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  get question(): string {
    return this._question.toString();
  }

  get answer(): string {
    return this._answer;
  }

  get type(): QuestionTypes {
    return this._type;
  }

  get tags(): string[] {
    return this._tags;
  }

  updateContent(
    question: string, 
    answer: string, 
    type: QuestionTypes, 
    tags: string[]
  ): void {
    this._question = question;
    this._answer = answer;
    this._type = type;
    this._tags = tags;
  }

  matchesKeyword(keyword: string): boolean {
    return this._question.toString().includes(keyword) ||
           this._answer.includes(keyword) ||
           this._tags.some(tag => tag.includes(keyword));
  }
}