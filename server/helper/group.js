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
    get_group: (groupId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                // get recent chat if group is available or if user in group
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
                    $set: {
                        status: 'available',
                        isAdmin: {
                            $cond: {
                                if: {
                                    $eq: [userId, "$admin"]
                                },
                                then: true, else: false
                            }
                        }
                    }
                }]).toArray()

                if (res?.[0]) {
                    resolve({
                        details: res?.[0],
                        items: []
                    })
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
    }
}