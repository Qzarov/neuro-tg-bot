import * as mongoDB from "mongodb";
import config from "../config";

// Global
export const collections: { 
    users?: mongoDB.Collection 
} = {}


// Initialize Connection
export async function connectToMongo() {
    try {
        const client: mongoDB.MongoClient = new mongoDB.MongoClient(config.MONGODB_CONNECTION);
        await client.connect();
            
        const db: mongoDB.Db = client.db(config.MONGODB_NAME);
        const usersCollection: mongoDB.Collection = db.collection(config.MONGO_COLLECTION_USERS);
        collections.users = usersCollection;
           
        console.log(`🔌  Successfully connected to database: ${db.databaseName} and collection: ${usersCollection.collectionName}`);
    } catch(error) {
        console.error("❌  Database connection failed", error);
    }

 }