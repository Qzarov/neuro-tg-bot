import * as mongoDB from "mongodb";
import config from "../config";

// Global
export const collections: { 
    users?: mongoDB.Collection,
    history?: mongoDB.Collection,
    messages?: mongoDB.Collection,
    scannedChats?: mongoDB.Collection,
    apiTokens?: mongoDB.Collection,
} = {};

// Initialize Connection
export async function connectToMongo() {
    try {
        const client: mongoDB.MongoClient = new mongoDB.MongoClient(config.MONGODB_CONNECTION);
        await client.connect();
            
        const db: mongoDB.Db = client.db(config.MONGODB_NAME);
        const usersCollection: mongoDB.Collection = db.collection(config.MONGO_COLLECTION_USERS);
        const historyCollection: mongoDB.Collection = db.collection(config.MONGO_COLLECTION_REQUESTS_HISTORY);
        const messagesCollection: mongoDB.Collection = db.collection(config.MONGO_COLLECTION_MESSAGES_HISTORY);
        const scannedChatsCollection: mongoDB.Collection = db.collection(config.MONGO_COLLECTION_CHATS_FOR_SCAN);
        const apiTokensCollection: mongoDB.Collection = db.collection(config.MONGO_COLLECTION_API_TOKENS);
        
        collections.users = usersCollection;
        collections.history = historyCollection;
        collections.messages = messagesCollection;
        collections.scannedChats = scannedChatsCollection;
        collections.apiTokens = apiTokensCollection;

        apiTokensCollection.createIndex({ "token": 1 }, { unique: true });
           
        console.log(
            `🔌  Successfully connected to database: ${db.databaseName}. Includes:\n\t- ${usersCollection.collectionName}\n\t- ${historyCollection.collectionName},\n\t- ${messagesCollection.collectionName},\n\t- ${scannedChatsCollection.collectionName},\n\t- ${apiTokensCollection.collectionName},`
        );
    } catch(error) {
        console.error("❌  Database connection failed", error);
    }
}