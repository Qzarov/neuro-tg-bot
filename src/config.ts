import dotenv from "dotenv";
dotenv.config()


interface ENV {
  NODE_ENV:   string | undefined;
  BOT_TOKEN:  string | undefined;
}

interface Config {
  NODE_ENV:   string;
  BOT_TOKEN:  string;
}

const getConfig = (): ENV => {
  return {
    NODE_ENV: process.env.NODE_ENV,
    BOT_TOKEN: process.env.BOT_TOKEN ? String(process.env.BOT_TOKEN) : undefined,
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