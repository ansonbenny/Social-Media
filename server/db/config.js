import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db = null;

export const connectDB = async (callback) => {
  try {
    let res = await MongoClient.connect(process.env?.DB_URL);
    if (res) {
      db = res.db("SoftChat");
      return callback(true, undefined);
    }
  } catch (err) {
    return callback(undefined, err);
  }
};

export { db };
