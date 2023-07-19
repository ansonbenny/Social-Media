import { db } from "../db/config.js";
import { ObjectId } from "mongodb";
import collections from "../db/collections.js";

export default {
  newMsg: (details) => {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await db.collection(collections.CHAT).updateOne(
          {
            $or: [
              {
                users: details?.users,
              },
              {
                users: [details?.users[1], details?.users[0]],
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
  removeSocketId: (socketId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.collection(collections.USERS).updateOne(
          {
            socketId: socketId,
          },
          {
            $unset: {
              socketId: 1,
            },
          }
        );

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },
  getUserChats: (to, me) => {
    // add limit and skip for pagination
    return new Promise(async (resolve, reject) => {
      try {
        let chats = await db
          .collection(collections.USERS)
          .aggregate([
            {
              $match: {
                _id: new ObjectId(to),
              },
            },
            {
              $project: {
                _id: 0,
                details: {
                  _id: {
                    $toString: "$_id",
                  },
                  name: "$name",
                  number: "$number",
                  about: "$about",
                  img: "$img",
                },
              },
            },
            {
              $lookup: {
                from: collections.CHAT,
                pipeline: [
                  {
                    $match: {
                      $or: [
                        {
                          users: [to, me],
                        },
                        {
                          users: [me, to],
                        },
                      ],
                    },
                  },
                  {
                    $unwind: "$chat",
                  },
                  {
                    $project: {
                      _id: "$_id",
                      id: "$chat.id",
                      msg: "$chat.msg",
                      from: "$chat.from",
                    },
                  },
                ],
                as: "chats",
              },
            },
          ])
          .toArray();

        if (chats?.[0]) {
          resolve(chats?.[0]);
        } else if (chats) {
          reject({ status: 404, message: "User Not Found" });
        }
      } catch (err) {
        reject(err);
      }
    });
  },
};
