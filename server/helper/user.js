import { db } from "../db/config.js";
import collections from "../db/collections.js";

export default {
  register_request: (details) => {
    return new Promise(async (resolve, reject) => {
      let response;
      try {
        await db
          .collection(collections.TEMP)
          .createIndex({ email: 1 }, { unique: true });
        await db
          .collection(collections.TEMP)
          .createIndex({ expireAt: 1 }, { expireAfterSeconds: 3600 });

        let check = await db.collection(collections.USERS).findOne({
          email: details.email.replace("_register", ""),
        });

        if (!check) {
          response = await db.collection(collections.TEMP).insertOne({
            ...details,
            expireAt: new Date(),
          });
        } else {
          reject({ status: 422, message: "Already Registered" });
        }
      } catch (err) {
        if (err?.code === 11000) {
          response = await db
            .collection(collections.TEMP)
            .findOneAndUpdate(
              {
                email: details?.email,
              },
              {
                $set: {
                  ...details,
                  expireAt: new Date(),
                },
              }
            )
            .catch((err_2) => {
              console.log(err_2);
              reject(err_2);
            });
        } else {
          console.log(err);
          reject(err);
        }
      } finally {
        if (response) {
          if (response?.insertedId) {
            resolve({ _id: response.insertedId.toString() });
          } else if (response?.value?._id) {
            resolve({ _id: response.value._id.toString() });
          }
        }
      }
    });
  },
  get_user: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await db.collection(collections.USERS).findOne({
          _id: new ObjectId(userId),
        });

        if (user) {
          delete user?.password;
          resolve(user);
        } else {
          reject({ status: 404, message: "User Not Found" });
        }
      } catch (err) {
        reject(err);
      }
    });
  },
  register_verify: (email, secret) => {
    return new Promise(async (resolve, reject) => {
      let response;
      try {
        await db
          .collection(collections.USERS)
          .createIndex({ email: 1 }, { unique: true });

        let already = await db.collection(collections.USERS).findOne({
          email: email?.replace?.("_register", ""),
        });

        if (!already) {
          let temp = await db.collection(collections.TEMP).findOne({
            email,
            secret,
          });

          if (temp) {
            delete temp.secret;
            delete temp.expireAt;

            temp.email = temp.email.replace("_register", "");

            response = await db.collection(collections.USERS).insertOne(temp);
          } else {
            reject({ status: 422, message: "Wrong Verification Details" });
          }
        } else {
          reject({ status: 422, message: "Already Registered" });
        }
      } catch (err) {
        if (err?.code === 11000) {
          reject({ status: 422, message: "Already Registered" });
        } else {
          reject(err);
        }
      } finally {
        if (response) {
          await db
            .collection(collections.TEMP)
            .deleteOne({
              email,
            })
            .catch((err) => {
              console.log("Temp Delete Error : ", err);
            });
          resolve(response);
        }
      }
    });
  },
};
