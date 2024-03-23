import dotenv from "dotenv";
dotenv.config()


interface ENV {
  NODE_ENV:   string | undefined;
  BOT_TOKEN:  string | undefined;

  GPT_API_SECRET: string | undefined;
}

interface Config {
  NODE_ENV:   string;
  BOT_TOKEN:  string;

  GPT_API_SECRET: string;
}

const getConfig = (): ENV => {
  return {
    NODE_ENV: process.env.NODE_ENV,
    BOT_TOKEN: process.env.BOT_TOKEN ? String(process.env.BOT_TOKEN) : undefined,

    GPT_API_SECRET: process.env.GPT_API_SECRET ? String(process.env.GPT_API_SECRET) : undefined,
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