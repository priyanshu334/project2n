// lib/appwrite.ts
import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client();

if (!process.env.NEXT_PUBLIC_APPWRITE_END_POINT) {
  throw new Error(`APPWRITE END POINT`);
}

if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  throw new Error(`APPWRITE PROJECT ID NOT FOUND IN ENV`);
}

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_END_POINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

export { client, account, databases, storage };
