import { db } from "../db/config.js";
import { ObjectId } from "mongodb";
import collections from "../db/collections.js";

export default {
    create_group: (details, { _id, userId }) => {
        return new Promise(async (resolve, reject) => {
            try {
                let res = await db.collection(collections.GROUP).insertOne({
                    _id: new ObjectId(_id),
                    admin: userId,
                    users: [userId],
                    ...details
                })

                resolve(res)
            } catch (err) {
                reject(err)
            }
        })
    },
    edit_group: (details, { _id, userId }) => {
        return new Promise(async (resolve, reject) => {
            try {
                let res = await db.collection(collections.GROUP).updateOne({
                    _id: new ObjectId(_id),
                    admin: userId
                }, {
                    $set: details
                })

                resolve(res)
            } catch (err) {
                reject(err)
            }
        })
    },
    get_members: ({ groupId, offset = 0 }) => {
        return new Promise(async (resolve, reject) => {
            try {
                let total = await db.collection(collections.GROUP).aggregate([{
                    $match: {
                        _id: new ObjectId(groupId)
                    }
                }, {
                    $unwind: "$users"
                }, {
                    $group: {
                        _id: 1,
                        count: {
                            $sum: 1
                        }
                    }
                }]).toArray()

                let users = await db.collection(collections.GROUP).aggregate([{
                    $match: {
                        _id: new ObjectId(groupId)
                    }
                }, {
                    $unwind: "$users"
                }, {
                    $sort: {
                        "users": 1
                    }
                }, {
                    $skip: parseInt(offset)
                }, {
                    $limit: 10 // limit
                }, {
                    $project: {
                        _id: {
                            $toObjectId: "$users"
                        },
                        admin: "$admin"
                    }
                }, {
                    $lookup: {
                        from: collections.USERS,
                        localField: "_id",
                        foreignField: "_id",
                        as: "user"
                    }
                }, {
                    $project: {
                        _id: {
                            $arrayElemAt: ["$user._id", 0]
                        },
                        name: {
                            $arrayElemAt: ["$user.name", 0]
                        },
                        img: {
                            $arrayElemAt: ["$user.img", 0]
                        },
                        isAdmin: {
                            $cond: {
                                if: {
                                    $eq: ["$_id", {
                                        $toObjectId: "$admin"
                                    }]
                                },
                                then: true, else: false
                            }
                        }
                    }
                }]).toArray()

                resolve({
                    users,
                    total: total?.[0]?.count || 0
                })
            } catch (err) {
                reject(err)
            }
        })
    },
    get_group: (groupId, { userId, offset = 0 }) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.collection(collections.GROUP).updateOne({
                    $and: [
                        {
                            _id: new ObjectId(groupId),
                        },
                        {
                            users: {
                                $in: [userId]
                            },
                        }
                    ],
                    "chat": {
                        $exists: true
                    }
                }, {
                    $push: {
                        "chat.$[elm].read": userId
                    }
                }, {
                    arrayFilters: [{
                        "elm.from": { $ne: userId },
                        "elm.read": {
                            $nin: [userId]
                        }
                    }]
                });

                const res = await db.collection(collections.GROUP).aggregate([{
                    $match: {
                        $expr: {
                            $and: [{
                                $eq: ["$_id", new ObjectId(groupId)]
                            }, {
                                $in: [userId, "$users"]
                            }]
                        }
                    }
                }, {
                    $project: {
                        _id: 0,
                        details: {
                            status: 'available',
                            isAdmin: {
                                $cond: {
                                    if: {
                                        $eq: [userId, "$admin"]
                                    },
                                    then: true, else: false
                                }
                            },
                            img: "$img",
                            name: "$name",
                            about: "$about",
                            _id: "$_id"
                        }
                    }
                }, {
                    $lookup: {
                        from: collections.GROUP,
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                        $eq: ["$_id", new ObjectId(groupId)]
                                    }, {
                                        $in: [userId, "$users"]
                                    }]
                                }
                            }
                        }, {
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
                        }, {
                            $lookup: {
                                from: collections.USERS,
                                let: { userId: "$msgs.from" },
                                pipeline: [{
                                    $match: {
                                        $expr: {
                                            $and: {
                                                $eq: ["$_id", {
                                                    $toObjectId: "$$userId"
                                                }]
                                            }
                                        }
                                    }
                                }, {
                                    $project: {
                                        _id: 0,
                                        user_name: "$name",
                                        profile: "$img"
                                    }
                                }],
                                as: "user"
                            }
                        }, {
                            $group: {
                                _id: 1,
                                msgs: {
                                    $push: {
                                        $mergeObjects: ["$msgs", {
                                            read: {
                                                $cond: {
                                                    if: {
                                                        $and: [{
                                                            $eq: ['array', { $type: "$msgs.read" }]
                                                        }, {
                                                            $gt: [{ $size: "$msgs.read" }, 0]
                                                        }]
                                                    },
                                                    then: true, else: false
                                                }
                                            }
                                        }, {
                                                $arrayElemAt: ["$user", 0]
                                            }]
                                    }
                                }
                            }
                        }, {
                            $set: {
                                msgs: {
                                    $reverseArray: "$msgs",
                                },
                            },
                        }],
                        as: "chat"
                    }
                }, {
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
                }]).toArray()

                if (res?.[0]) {
                    resolve(res?.[0])
                } else if (res) {
                    reject("Group Not Found")
                }
            } catch (err) {
                reject(err)
            }
        })
    },
    get_groups: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                // move to aggregate for recent msgs based
                const res = await db.collection(collections.GROUP).aggregate([{
                    $match: {
                        users: {
                            $in: [userId]
                        }
                    }
                }, {
                    $project: {
                        id: "$_id",
                        details: {
                            _id: "$_id",
                            name: "$name",
                            about: "$about",
                            img: "$img"
                        }
                    }
                }]).toArray()

                resolve(res)
            } catch (err) {
                reject(err)
            }
        })
    },
    get_user_group_ids: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let res = await db.collection(collections.GROUP).aggregate([{
                    $match: {
                        users: {
                            $in: [userId]
                        }
                    }
                }, {
                    $group: {
                        _id: 1,
                        ids: {
                            $push: {
                                $toString: "$_id"
                            }
                        }
                    }
                }]).toArray()

                resolve(res?.[0]?.ids)
            } catch (err) {
                reject(err)
            }
        })
    },
    newMsg: (_id, msg) => {
        return new Promise(async (resolve, reject) => {
            try {
                let res = await db.collection(collections.GROUP).updateOne({
                    _id: new ObjectId(_id),
                    users: {
                        $in: [msg?.from]
                    }
                }, {
                    $push: {
                        chat: msg
                    }
                })

                resolve(res)
            } catch (err) {
                reject(err)
            }
        })
    }
}