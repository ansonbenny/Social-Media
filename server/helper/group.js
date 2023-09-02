import { db } from "../db/config.js";
import { ObjectId } from "mongodb";
import collections from "../db/collections.js";

export default {
    create_group: ({ _id, userId, ...details }) => {
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
    }
}