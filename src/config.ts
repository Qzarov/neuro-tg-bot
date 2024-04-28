import dotenv from "dotenv";
dotenv.config()


interface ENV {
  // General
  NODE_ENV:   string | undefined;
  BOT_TOKEN:  string | undefined;

  // GPT
  GPT_API_SECRET: string | undefined;

  // Mongo DB
  MONGODB_CONNECTION:     string | undefined;
  MONGODB_NAME:           string | undefined;
  MONGO_COLLECTION_USERS: string | undefined;
}

interface Config {
  // General
  NODE_ENV:   string;
  BOT_TOKEN:  string;

  // GPT
  GPT_API_SECRET: string;

  // Mongo DB
  MONGODB_CONNECTION:     string;
  MONGODB_NAME:           string;
  MONGO_COLLECTION_USERS: string;
}

const getConfig = (): ENV => {
  return {
    // General
    NODE_ENV:   process.env.NODE_ENV,
    BOT_TOKEN:  process.env.BOT_TOKEN ? String(process.env.BOT_TOKEN) : undefined,

    // GPT
    GPT_API_SECRET:     process.env.GPT_API_SECRET ? String(process.env.GPT_API_SECRET) : undefined,

    // Mongo DB
    MONGODB_CONNECTION:     process.env.MONGODB_CONNECTION      ? String(process.env.MONGODB_CONNECTION)      : undefined,
    MONGODB_NAME:           process.env.MONGODB_NAME            ? String(process.env.MONGODB_NAME)            : undefined,
    MONGO_COLLECTION_USERS: process.env.MONGO_COLLECTION_USERS  ? String(process.env.MONGO_COLLECTION_USERS)  : undefined,
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