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
            $addToSet: {
              socketId: socketId,
            },
          }
        );

        resolve();
      } catch (err) {
        resolve();
      }
    });
  },
  getSocketId: (to, from) => {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await db
          .collection(collections.USERS)
          .aggregate([
            {
              $match: {
                _id: new ObjectId(to),
              },
            },
            {
              $project: {
                ids: "$socketId",
              },
            },
            {
              $lookup: {
                from: collections.USERS,
                pipeline: [
                  {
                    $match: {
                      _id: new ObjectId(from),
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      socketId: "$socketId",
                      name: "$name",
                    },
                  },
                ],
                as: "from",
              },
            },
            {
              $project: {
                _id: 1,
                name: {
                  $arrayElemAt: ["$from.name", 0],
                },
                ids: {
                  $concatArrays: [
                    "$ids",
                    {
                      $arrayElemAt: ["$from.socketId", 0],
                    },
                  ],
                },
              },
            },
          ])
          .toArray();

        if (res?.[0]) {
          resolve(res?.[0]);
        } else if (res) {
          reject("Something Went Wrong");
        }
      } catch (err) {
        reject(err);
      }
    });
  },
  removeSocketId: (socketId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.collection(collections.USERS).updateMany(
          {
            socketId: socketId,
          },
          {
            $pull: {
              socketId: socketId,
            },
          }
        );

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },
  getUserChats: (to, { userId, skip = 0 }) => {
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
                  user: {
                    $toBool: true,
                  },
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
                          users: [to, userId],
                        },
                        {
                          users: [userId, to],
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      msgs: {
                        $reverseArray: "$chat",
                      },
                    },
                  },
                  {
                    $unwind: "$msgs",
                  },
                  {
                    $skip: parseInt(skip),
                  },
                  {
                    $limit: 10,
                  },
                  {
                    $group: {
                      _id: 1,
                      msgs: {
                        $push: "$msgs",
                      },
                    },
                  },
                  {
                    $set: {
                      msgs: {
                        $reverseArray: "$msgs",
                      },
                    },
                  },
                ],
                as: "chat",
              },
            },
            {
              $set: {
                chat: {
                  $arrayElemAt: ["$chat", 0],
                },
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
  }
};
