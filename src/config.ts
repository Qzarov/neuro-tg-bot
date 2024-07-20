import dotenv from "dotenv";
dotenv.config()


interface ENV {
  // General
  NODE_ENV?:   string;
  BOT_TOKEN?:  string;

  // GPT
  GPT_API_SECRET?: string;

  // Mongo DB
  MONGODB_CONNECTION?:     string;
  MONGODB_NAME?:           string;
  MONGO_COLLECTION_USERS?: string;
  MONGO_COLLECTION_HISTORY?: string;
  MONGO_COLLECTION_API_TOKENS?: string;
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
    MONGO_COLLECTION_HISTORY: process.env.MONGO_COLLECTION_HISTORY 
      ? String(process.env.MONGO_COLLECTION_HISTORY)
      : undefined,
    MONGO_COLLECTION_API_TOKENS: process.env.MONGO_COLLECTION_API_TOKENS 
      ? String(process.env.MONGO_COLLECTION_API_TOKENS)
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