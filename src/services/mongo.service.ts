import * as mongoDB from "mongodb";
import config from "../config";

// Global
export const collections: { 
    users?: mongoDB.Collection,
    history?: mongoDB.Collection,
    apiTokens?: mongoDB.Collection,
} = {};

// export let collections: Required<Collections>;

// Initialize Connection
export async function connectToMongo() {
    try {
        const client: mongoDB.MongoClient = new mongoDB.MongoClient(config.MONGODB_CONNECTION);
        await client.connect();
            
        const db: mongoDB.Db = client.db(config.MONGODB_NAME);
        const usersCollection: mongoDB.Collection = db.collection(config.MONGO_COLLECTION_USERS);
        const historyCollection: mongoDB.Collection = db.collection(config.MONGO_COLLECTION_HISTORY);
        const apiTokensCollection: mongoDB.Collection = db.collection(config.MONGO_COLLECTION_API_TOKENS);
        
        collections.users = usersCollection;
        collections.history = historyCollection;
        collections.apiTokens = apiTokensCollection;

        apiTokensCollection.createIndex({ "token": 1 }, { unique: true });
           
        console.log(`🔌  Successfully connected to database: ${db.databaseName} and collections: ${usersCollection.collectionName}, ${historyCollection.collectionName}, ${apiTokensCollection.collectionName}`);
    } catch(error) {
        console.error("❌  Database connection failed", error);
    }
}