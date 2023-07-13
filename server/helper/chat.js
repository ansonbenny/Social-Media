import { db } from "../db/config.js";
import { ObjectId } from "mongodb";
import collections from "../db/collections.js";

export default {
  newMsg: (details) => {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await db.collection(collections.CHAT).updateOne(
          {
            $and: [
              {
                users: details?.users[0],
              },
              {
                users: details?.users[1],
              },
            ],
          },
          {
            $push: {
              chat: details?.chat,
            },
          }
        );

        if (res?.matchedCount <= 0) {
          let res = await db.collection(collections.CHAT).insertOne({
            ...details,
            chat: [details?.chat],
          });

          resolve(res);
        } else {
          resolve(res);
        }
      } catch (err) {
        reject(err);
      }
    });
  },
  addSocketId: (userId, socketId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.collection(collections.USERS).updateOne(
          {
            _id: new ObjectId(userId),
          },
          {
            $set: {
              socketId,
            },
          }
        );

        resolve();
      } catch (err) {
        resolve();
      }
    });
  },
  getSocketId: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await db.collection(collections.USERS).findOne({
          _id: new ObjectId(userId),
        });

        resolve(res);
      } catch (err) {
        reject(err);
      }
    });
  },
};
