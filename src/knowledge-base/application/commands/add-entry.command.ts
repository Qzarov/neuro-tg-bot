import { QuestionTypes } from "../../domain";


export class AddEntryCommand {
  constructor(
    public readonly userId: string,
    public readonly question: string,
    public readonly answer: string,
    public readonly type: QuestionTypes,
    public readonly tags: string[]
  ) {}
}