import mongoose from "mongoose";

type connectionObject = {
  isConnected?: number;
};

const connection: connectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log(`already connected to database`);
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {
      dbName: "vardhaman-next-backend",
    });
    connection.isConnected = db.connections[0].readyState;
    console.log(`Connected to database`);
  } catch (error) {
    console.log(`Failed to connect to database ${error}`);
    process.exit(1);
  }
}

export default dbConnect;
