import dotenv from "dotenv";
dotenv.config()


interface ENV {
  // General
  NODE_ENV?:   string;
  BOT_TOKEN?:  string;

  // Mongo DB
  MONGODB_CONNECTION?:     string;
  MONGODB_NAME?:           string;
  MONGO_COLLECTION_USERS?: string;
  MONGO_COLLECTION_REQUESTS_HISTORY?: string;
  MONGO_COLLECTION_MESSAGES_HISTORY?: string;
  MONGO_COLLECTION_CHATS_FOR_SCAN?: string;
  MONGO_COLLECTION_API_TOKENS?: string;
  MONGO_COLLECTION_KNOWLEDGE?: string;
  

  // AI
  GPT_MODEL?: string;
}

type Config = Required<ENV>

const getConfig = (): ENV => {
  return {
    // General
    NODE_ENV:   process.env.NODE_ENV,
    BOT_TOKEN:  process.env.BOT_TOKEN 
      ? String(process.env.BOT_TOKEN) 
      : undefined,

    // Mongo DB
    MONGODB_CONNECTION: process.env.MONGODB_CONNECTION 
      ? String(process.env.MONGODB_CONNECTION) 
      : undefined,
    MONGODB_NAME: process.env.MONGODB_NAME 
      ? String(process.env.MONGODB_NAME) 
      : undefined,
    MONGO_COLLECTION_USERS: process.env.MONGO_COLLECTION_USERS 
      ? String(process.env.MONGO_COLLECTION_USERS) 
      : undefined,
    MONGO_COLLECTION_REQUESTS_HISTORY: process.env.MONGO_COLLECTION_REQUESTS_HISTORY 
      ? String(process.env.MONGO_COLLECTION_REQUESTS_HISTORY)
      : undefined,
    MONGO_COLLECTION_MESSAGES_HISTORY: process.env.MONGO_COLLECTION_MESSAGES_HISTORY 
      ? String(process.env.MONGO_COLLECTION_MESSAGES_HISTORY)
      : undefined,
    MONGO_COLLECTION_CHATS_FOR_SCAN: process.env.MONGO_COLLECTION_CHATS_FOR_SCAN 
      ? String(process.env.MONGO_COLLECTION_CHATS_FOR_SCAN)
      : undefined,
    MONGO_COLLECTION_API_TOKENS: process.env.MONGO_COLLECTION_API_TOKENS 
      ? String(process.env.MONGO_COLLECTION_API_TOKENS)
      : undefined,
    MONGO_COLLECTION_KNOWLEDGE: process.env.MONGO_COLLECTION_KNOWLEDGE 
      ? String(process.env.MONGO_COLLECTION_KNOWLEDGE)
      : undefined,
    
    // AI
    GPT_MODEL: process.env.GPT_MODEL 
      ? String(process.env.GPT_MODEL)
      : undefined,
  };
};

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`⛔️  Missing key ${key} in .env`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;