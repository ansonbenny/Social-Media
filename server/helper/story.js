import { db } from "../db/config.js";
import { ObjectId } from "mongodb";
import collections from "../db/collections.js";

export default {
    add_story: (details) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.collection(collections.STORIES).createIndex({
                    createdAt: 1
                }, {
                    expireAfterSeconds: 86400
                })

                let res = await db.collection(collections.STORIES).updateOne({
                    _id: new ObjectId()
                }, {
                    $set: {
                        createdAt: new Date(),
                        ...details
                    }
                }, {
                    upsert: true
                })

                resolve(res)
            } catch (err) {
                reject(err)
            }
        })
    },
    get_stories: (friendId, myId, offset = 0) => {
        return new Promise(async (resolve, reject) => {
            try {
                let res = await db.collection(collections.PRIVATE).aggregate([{
                    $match: {
                        $expr: {
                            $or: [{
                                $eq: ["$users", [friendId, myId]]
                            }, {
                                $eq: ["$users", [myId, friendId]]
                            }, {
                                $eq: [myId, friendId]
                            }]
                        }
                    }
                }, {
                    $project: {
                        chat: {
                            $cond: {
                                if: {
                                    $eq: [myId, friendId]
                                },
                                then: [{
                                    from: myId
                                }],
                                else: "$chat"
                            }
                        }
                    }
                }, {
                    $unwind: "$chat"
                }, {
                    $group: {
                        _id: 1,
                        users: {
                            $addToSet: "$chat.from"
                        }
                    }
                }, {
                    $match: {
                        $expr: {
                            $or: [{
                                $eq: ["$users", [friendId, myId]]
                            }, {
                                $eq: ["$users", [myId, friendId]]
                            }, {
                                $eq: ["$users", [myId]]
                            }]
                        }
                    }
                }, {
                    $lookup: {
                        from: collections.STORIES,
                        pipeline: [{
                            $match: {
                                userId: friendId
                            }
                        }, {
                            $group: {
                                _id: 1,
                                count: {
                                    $sum: 1
                                }
                            }
                        }],
                        as: "total"
                    }
                }, {
                    $lookup: {
                        from: collections.STORIES,
                        pipeline: [{
                            $match: {
                                userId: friendId
                            }
                        }, {
                            $lookup: {
                                from: collections.USERS,
                                pipeline: [{
                                    $match: {
                                        _id: new ObjectId(friendId)
                                    }
                                }],
                                as: "user"
                            }
                        }, {
                            $set: {
                                user: {
                                    $arrayElemAt: ['$user', 0]
                                }
                            }
                        }, {
                            $sort: {
                                _id: -1
                            }
                        }, {
                            $skip: parseInt(offset)
                        }, {
                            $limit: 10
                        }],
                        as: "stories"
                    }
                }, {
                    $project: {
                        _id: 0,
                        stories: 1,
                        total: {
                            $arrayElemAt: ["$total.count", 0]
                        }
                    }
                }]).toArray()

                if (res?.[0]) {
                    resolve(res?.[0])
                } else if (friendId == myId) {
                    resolve({ total: 0, stories: [] })
                } else {
                    reject({
                        status: 404,
                        message: "Not Found"
                    })
                }
            } catch (err) {
                reject(err)
            }
        })
    },
    delete_story: (details) => {
        return new Promise(async (resolve, reject) => {
            try {
                let res = await db.collection(collections.STORIES).deleteOne({
                    _id: new ObjectId(details?._id),
                    userId: details?.userId
                })

                if (res?.deletedCount >= 1) {
                    resolve(res)
                } else {
                    reject("Delete Failed")
                }
            } catch (err) {
                reject(err)
            }
        })
    },
    get_users: ({ userId, offset = 0 }) => {
        return new Promise(async (resolve, reject) => {
            try {
                let res = await db.collection(collections.PRIVATE).aggregate([{
                    $match: {
                        users: {
                            $in: [userId]
                        }
                    }
                }, {
                    $unwind: "$chat"
                }, {
                    $group: {
                        _id: "$users",
                        from: {
                            $addToSet: {
                                $cond: {
                                    if: {
                                        $eq: ["$chat.from", userId]
                                    },
                                    then: userId, else: "friend"
                                }
                            }
                        },
                    }
                }, {
                    $match: {
                        $expr: {
                            $and: [{
                                $in: [userId, "$from"]
                            }, {
                                $in: ["friend", "$from"]
                            }]
                        }
                    }
                }, {
                    $unwind: "$_id"
                }, {
                    $match: {
                        _id: {
                            $ne: userId
                        }
                    }
                }, {
                    $lookup: {
                        from: collections.STORIES,
                        let: { friendId: "$_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                        $eq: ["$userId", "$$friendId"]
                                    }]
                                }
                            }
                        }, {
                            $sort: {
                                _id: -1
                            }
                        }, {
                            $group: {
                                _id: 1,
                                recent: {
                                    $first: "$_id"
                                },
                                userId: {
                                    $first: "$userId"
                                }
                            }
                        }, {
                            $lookup: {
                                from: collections.USERS,
                                let: { userId: "$userId" },
                                pipeline: [{
                                    $match: {
                                        $expr: {
                                            $and: [{
                                                $eq: ["$_id", {
                                                    $toObjectId: "$$userId"
                                                }]
                                            }]
                                        }
                                    }
                                }],
                                as: "user_data"
                            }
                        }, {
                            $project: {
                                _id: 0,
                                recent: 1,
                                id: {
                                    $arrayElemAt: ["$user_data._id", 0]
                                },
                                name: {
                                    $arrayElemAt: ["$user_data.name", 0]
                                },
                                about: {
                                    $arrayElemAt: ["$user_data.about", 0]
                                },
                                img: {
                                    $arrayElemAt: ["$user_data.img", 0]
                                }
                            }
                        }],
                        as: "user"
                    }
                }, {
                    $project: {
                        _id: 0,
                        recent: {
                            $arrayElemAt: ["$user.recent", 0]
                        },
                        id: {
                            $arrayElemAt: ["$user.id", 0]
                        },
                        details: {
                            name: {
                                $arrayElemAt: ["$user.name", 0]
                            },
                            about: {
                                $arrayElemAt: ["$user.about", 0]
                            },
                            img: {
                                $arrayElemAt: ["$user.img", 0]
                            }
                        }
                    }
                }, {
                    $match: {
                        id: {
                            $exists: true
                        }
                    }
                }, {
                    $sort: {
                        recent: -1
                    }
                }, {
                    $skip: parseInt(offset)
                }, {
                    $limit: 10
                }]).toArray()

                resolve(res)
            } catch (err) {
                reject(err)
            }
        })
    }
}