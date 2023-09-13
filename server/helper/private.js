import { db } from "../db/config.js";
import { ObjectId } from "mongodb";
import collections from "../db/collections.js";

export default {
  newMsg: (details) => {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await db.collection(collections.PRIVATE).updateOne(
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
          let res = await db.collection(collections.PRIVATE).insertOne({
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
        let previous = await db.collection(collections.USERS).findOneAndUpdate(
          {
            _id: new ObjectId(userId),
          },
          {
            $set: {
              socketId: socketId,
            },
          }
        );

        resolve(previous?.value);
      } catch (err) {
        resolve();
      }
    });
  },
  getSocketIdTo: (to) => {
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
            }
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
    })
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
                ids: ["$ids", {
                  $arrayElemAt: ["$from.socketId", 0],
                }]
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
        let previous = await db.collection(collections.USERS).findOneAndUpdate(
          {
            socketId: socketId,
          },
          {
            $unset: {
              socketId: 1,
            },
          }
        );

        resolve(previous?.value);
      } catch (err) {
        reject(err);
      }
    });
  },
  getUserChats: (to, { userId, offset = 0 }) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.collection(collections.PRIVATE).updateOne({
          $or: [
            {
              users: [to, userId],
            },
            {
              users: [userId, to],
            },
          ],
          "chat": {
            $exists: true
          }
        }, {
          $set: {
            "chat.$[elm].read": true
          }
        }, {
          arrayFilters: [{
            "elm.from": { $eq: to },
            "elm.read": {
              $ne: true
            }
          }]
        });

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
                  status: {
                    $cond: {
                      if: {
                        $eq: ['string', {
                          $type: "$socketId"
                        }]
                      },
                      then: 'online', else: false
                    }
                  }
                },
              },
            },
            {
              $lookup: {
                from: collections.PRIVATE,
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
                    $skip: parseInt(offset),
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
                items: {
                  $arrayElemAt: ["$chat.msgs", 0],
                },
              },
            },
            {
              $project: {
                items: 1,
                details: 1
              }
            }
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
  readMsgs: (from, to) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.collection(collections.PRIVATE).updateOne({
          $and: [{
            $or: [
              {
                users: [to, from],
              },
              {
                users: [from, to],
              },
            ]
          }, {
            "chat": {
              $exists: true
            }
          }],
        }, {
          $set: {
            "chat.$[elm].read": true
          }
        }, {
          arrayFilters: [{
            "elm.from": { $eq: from },
            "elm.read": {
              $ne: true
            }
          }]
        });

        resolve()
      } catch (err) {
        reject()
      }
    })
  },
  get_recent_users: (userId, offset = 0) => {
    return new Promise(async (resolve, reject) => {
      try {
        const users = await db.collection(collections.PRIVATE).aggregate([{
          $match: {
            users: {
              $in: [userId],
              $ne: [userId, userId]
            }
          }
        }, {
          $project: {
            users: 1,
            "last_msg": {
              $last: "$chat"
            },
            id: {
              $first: {
                $filter: {
                  input: "$users",
                  as: "users",
                  cond: {
                    $ne: ["$$users", userId]
                  }
                }
              }
            }
          }
        }, {
          $sort: {
            "last_msg.id": -1
          }
        }, {
          $skip: parseInt(offset)
        }, {
          $limit: 15 // limit
        }, {
          $lookup: {
            from: collections.USERS,
            let: { user: "$id" },
            pipeline: [{
              $match: {
                $expr: {
                  $eq: ["$_id", {
                    $toObjectId: "$$user"
                  }]
                }
              }
            }, {
              $project: {
                _id: "$_id",
                name: "$name",
                about: "$about",
                img: "$img",
                socketId: "$socketId"
              }
            }],
            as: "details"
          }
        }, {
          $set: {
            details: {
              $arrayElemAt: ["$details", 0]
            }
          }
        }, {
          $match: {
            "details._id": {
              $exists: true
            }
          }
        }, {
          $lookup: {
            from: collections.PRIVATE,
            let: { users: "$users" },
            pipeline: [{
              $match: {
                $expr: {
                  $eq: ["$users", "$$users"]
                }
              }
            }, {
              $unwind: "$chat"
            }, {
              $match: {
                "chat.read": {
                  $ne: true
                },
                "chat.from": {
                  $ne: userId
                }
              }
            }, {
              $group: {
                _id: 1,
                total: {
                  $sum: 1
                }
              }
            }],
            as: "unread"
          }
        }, {
          $project: {
            _id: 0,
            id: 1,
            details: 1,
            status: {
              $cond: {
                if: {
                  $eq: [{
                    $type: "$details.socketId"
                  }, 'string']
                }, then: true, else: false
              }
            },
            unread: {
              $arrayElemAt: ["$unread.total", 0]
            }
          }
        }]).toArray()

        resolve(users || [])
      } catch (err) {
        reject(err)
      }
    })
  },
  get_user: ({ userId, chatId }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await db.collection(collections.USERS).aggregate([{
          $match: {
            "_id": new ObjectId(chatId)
          }
        }, {
          $project: {
            _id: 0,
            id: "$_id",
            details: {
              _id: "$_id",
              name: "$name",
              about: "$about",
              img: "$img"
            }
          }
        }, {
          $lookup: {
            from: collections.PRIVATE,
            pipeline: [{
              $match: {
                $expr: {
                  $or: [{
                    $eq: ["$users", [userId, chatId]]
                  }, {
                    $eq: ["$users", [chatId, userId]]
                  }]
                }
              }
            }, {
              $unwind: "$chat"
            }, {
              $match: {
                "chat.read": {
                  $ne: true
                },
                "chat.from": {
                  $ne: userId
                }
              }
            }, {
              $group: {
                _id: 1,
                total: {
                  $sum: 1
                }
              }
            }],
            as: "unread"
          }
        }, {
          $set: {
            status: true,
            unread: {
              $arrayElemAt: ["$unread.total", 0]
            }
          }
        }]).toArray()

        resolve(user?.[0] || {})

      } catch (err) {
        reject(err)
      }
    })
  },
  get_total_unreaded: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let total = await db.collection(collections.PRIVATE).aggregate([{
          $match: {
            users: {
              $in: [userId],
              $ne: [userId, userId]
            }
          },
        }, {
          $set: {
            id: {
              $first: {
                $filter: {
                  input: "$users",
                  as: "users",
                  cond: {
                    $ne: ["$$users", userId]
                  }
                }
              }
            }
          }
        }, {
          $lookup: {
            from: collections.USERS,
            let: { user: "$id" },
            pipeline: [{
              $match: {
                $expr: {
                  $eq: ["$_id", {
                    $toObjectId: "$$user"
                  }]
                }
              }
            }, {
              $project: {
                _id: "$_id"
              }
            }],
            as: "details"
          }
        }, {
          $match: {
            $expr: {
              $eq: ["$details", [{
                "_id": {
                  $toObjectId: "$id"
                }
              }]]
            }
          }
        }, {
          $unwind: "$chat"
        }, {
          $match: {
            "chat.read": {
              $ne: true
            },
            "chat.from": {
              $ne: userId
            }
          }
        }, {
          $group: {
            _id: 1,
            count: {
              $sum: 1
            }
          }
        }]).toArray()

        resolve(total?.[0]?.count || 0)
      } catch (err) {
        reject(err)
      }
    })
  },
  getMediaSigleChat: ({ userId, chatId, offset = 0 }) => {
    return new Promise(async (resolve, reject) => {
      try {
        let media = await db.collection(collections.USERS).aggregate([{
          $match: {
            _id: new ObjectId(chatId)
          },
        }, {
          $lookup: {
            from: collections.PRIVATE,
            pipeline: [{
              $match: {
                $or: [
                  {
                    users: [chatId, userId],
                  },
                  {
                    users: [userId, chatId],
                  },
                ],
              },
            }, {
              $unwind: "$chat"
            }, {
              $match: {
                "chat.file": {
                  $exists: true
                },
                "chat.msg": {
                  $exists: false
                }
              }
            }, {
              $sort: {
                "chat.id": -1
              }
            }, {
              $skip: parseInt(offset)
            }, {
              $limit: 6
            }, {
              $project: {
                id: "$chat.id",
                file: "$chat.file"
              }
            }],
            as: "media"
          }
        }, {
          $lookup: {
            from: collections.PRIVATE,
            pipeline: [{
              $match: {
                $or: [
                  {
                    users: [chatId, userId],
                  },
                  {
                    users: [userId, chatId],
                  },
                ],
              },
            }, {
              $unwind: "$chat"
            }, {
              $match: {
                "chat.file": {
                  $exists: true
                },
                "chat.msg": {
                  $exists: false
                }
              }
            }, {
              $group: {
                _id: 1,
                total: {
                  $sum: 1
                }
              }
            }],
            as: "total"
          }
        }, {
          $project: {
            _id: 0,
            total: {
              $arrayElemAt: ["$total.total", 0]
            },
            files: "$media"
          }
        }]).toArray()

        resolve(media?.[0] || {})
      } catch (err) {
        reject(err)
      }
    })
  },
  delete_msg_user: ({ users, ...details }) => {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await db.collection(collections.PRIVATE).updateOne({
          $or: [
            {
              users: users,
            },
            {
              users: [users[1], users[0]],
            },
          ],
        }, {
          $pull: {
            chat: details
          }
        })

        resolve(res)
      } catch (err) {
        reject(err)
      }
    })
  },
  searchUser: ({ search = '', userId, offset = 0 }) => {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await db.collection(collections.USERS).aggregate([{
          $lookup: {
            from: collections.USERS,
            pipeline: [{
              $match: {
                $or: [
                  {
                    number: search
                  }, {
                    _id: search?.length == 24 ? new ObjectId(search) : ''
                  }
                ]
              }
            }, {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id"
                },
                details: {
                  _id: "$_id",
                  name: "$name",
                  about: "$about",
                  img: "$img",
                  socketId: "$socketId"
                }
              }
            }],
            as: 'search'
          }
        }, {
          $lookup: {
            from: collections.USERS,
            pipeline: [{
              $match: {
                name: {
                  $regex: search,
                  $options: 'i'
                }
              }
            }, {
              $project: {
                id: {
                  $toString: "$_id"
                },
                details: {
                  _id: "$_id",
                  name: "$name",
                  about: "$about",
                  img: "$img",
                  socketId: "$socketId"
                }
              }
            }],
            as: 'by_name'
          }
        }, {
          $lookup: {
            from: collections.PRIVATE,
            let: { search: "$by_name" },
            pipeline: [{
              $match: {
                $expr: {
                  $in: [userId, "$users"]
                }
              }
            }, {
              $unwind: "$users"
            }, {
              $group: {
                _id: 1,
                users: {
                  $addToSet: "$users"
                },
                search: {
                  $first: "$$search"
                }
              }
            }, {
              $unwind: "$search"
            }, {
              $match: {
                $expr: {
                  $in: ["$search.id", "$users"]
                }
              }
            }, {
              $project: {
                _id: 0,
                id: "$search.id",
                details: "$search.details"
              }
            }],
            as: 'matched'
          }
        }, {
          $project: {
            _id: 1,
            items: {
              $concatArrays: ["$search", "$matched"]
            }
          }
        }, {
          $unwind: "$items"
        }, {
          $group: {
            _id: 1,
            items: {
              $addToSet: "$items"
            }
          }
        }, {
          $unwind: "$items"
        }, {
          $sort: {
            "items.id": -1
          }
        }, {
          $skip: parseInt(offset)
        }, {
          $limit: 15
        }, {
          $project: {
            _id: 0,
            id: "$items.id",
            details: "$items.details",
            status: {
              $cond: {
                if: {
                  $eq: [{
                    $type: "$items.details.socketId"
                  }, 'string']
                }, then: true, else: false
              }
            },
          }
        }]).toArray()

        resolve(res)
      } catch (err) {
        reject(err)
      }
    })
  },
  delete_chat_private: (users) => {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await db.collection(collections.PRIVATE).deleteOne({
          $or: [
            {
              users: users,
            },
            {
              users: [users[1], users[0]],
            },
          ],
        })

        resolve(res)
      } catch (err) {
        reject(err)
      }
    })
  }
};

