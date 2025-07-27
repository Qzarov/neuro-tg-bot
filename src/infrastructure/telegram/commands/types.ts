import { ApiTokenType } from "@api-tokens/domain";


export enum Command {
  start = "/start",
  user = "/user", // TODO add handler
  admin = "/admin",
  requestAccess = "/requestAccess",
  grantAccess = "/grantAccess",
  revokeAccess = "/revokeAccess",
  makeAdmin = "/makeAdmin",
  removeAdmin = "/removeAdmin",
  state = "/state",
  exitAdminMode = "/exitAdmin",
  addTokens = "/addTokens",
  takeTokens = "/takeTokens",
  getApiTokens = "/getApiTokens",
  addApiToken = "/addApiToken",
  deleteApiToken = "/deleteApiToken",
  chooseNeuro = "Выбрать таролога",
  useGPT = "Расклад от GPT",
  useGemini = "Расклад от Gemini",
  endUsingNeuro = "Закончить расклад",
};

export type CommandParams = {
  username?: string;
  tokens?: number;
  apiTokenType?: ApiTokenType;
  apiToken?: string;
};

export type CommandWithParams = {
  command: Command;
  params?: CommandParams;
};

export enum CallbackData {
  translate = "translate", 
  approveAccess = "approveAccess",
  rejectAccess = "rejectAccess",
};