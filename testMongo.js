import { MongoClient } from "mongodb";

const uri = "mongodb+srv://kagisosebogodi2025_db_user:60aoJbfNgst9EzUI@cluster0.5u4cvo9.mongodb.net/schoolheadoffice?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");
    const databasesList = await client.db().admin().listDatabases();
    console.log("📂 Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
  } catch (err) {
    console.error("❌ Connection error:", err);
  } finally {
    await client.close();
  }
}

run();
