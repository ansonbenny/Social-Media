import { db } from "../db/config.js";
import collections from "../db/collections.js";
import { ObjectId } from "mongodb";

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

        let email_check = await db.collection(collections.USERS).findOne({
          email: details?.email?.replace?.("_register", ""),
        });

        let number_check = await db.collection(collections.USERS).findOne({
          number: details?.number,
        });

        if (!email_check && !number_check) {
          delete details.number;

          response = await db.collection(collections.TEMP).insertOne({
            ...details,
            expireAt: new Date(),
          });
        } else {
          reject({
            status: 422,
            message: "Already Registered Email or Number",
          });
        }
      } catch (err) {
        if (err?.code === 11000) {
          delete details.number;

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
  register_verify: (details) => {
    return new Promise(async (resolve, reject) => {
      let response;
      try {
        await db
          .collection(collections.USERS)
          .createIndex({ email: 1 }, { unique: true });
        await db
          .collection(collections.USERS)
          .createIndex({ number: 1 }, { unique: true });

        let email_already = await db.collection(collections.USERS).findOne({
          email: details?.email?.replace?.("_register", ""),
        });

        let number_already = await db.collection(collections.USERS).findOne({
          number: details?.number,
        });

        if (!email_already && !number_already) {
          let temp = await db.collection(collections.TEMP).findOne({
            email: details?.email,
            secret: details?.secret,
          });

          if (temp) {
            delete details.secret;

            response = await db.collection(collections.USERS).insertOne({
              ...details,
              about: "Be brave to live differently.",
              email: details.email.replace("_register", ""),
            });
          } else {
            reject({ status: 422, message: "Wrong Verification Details" });
          }
        } else {
          reject({
            status: 422,
            message: "Already Registered Email or Number",
          });
        }
      } catch (err) {
        if (err?.code === 11000) {
          reject({
            status: 422,
            message: "Already Registered Email or Number",
          });
        } else {
          reject(err);
        }
      } finally {
        if (response) {
          await db
            .collection(collections.TEMP)
            .deleteOne({
              email: details?.email,
            })
            .catch((err) => {
              console.log("Temp Delete Error : ", err);
            });
          resolve(response);
        }
      }
    });
  },
  register_direct: (details) => {
    return new Promise(async (resolve, reject) => {
      let response;
      try {
        await db
          .collection(collections.USERS)
          .createIndex({ email: 1 }, { unique: true });
        await db
          .collection(collections.USERS)
          .createIndex({ number: 1 }, { unique: true });

        response = await db
          .collection(collections.USERS)
          .insertOne({ ...details, about: "Be brave to live differently." });
      } catch (err) {
        if (err?.code === 11000) {
          reject({
            status: 422,
            message: "Already Registered Email or Number",
          });
        } else {
          reject(err);
        }
      } finally {
        if (response) {
          await db
            .collection(collections.TEMP)
            .deleteOne({
              email: `${details?.email}_register`,
            })
            .catch((err) => {
              console.log("Temp Delete Error : ", err);
            });
          resolve(response);
        }
      }
    });
  },
  getUserByEmail: (email) => {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await db.collection(collections.USERS).findOne({
          email,
        });

        if (user) {
          resolve(user);
        } else {
          reject({
            status: 404,
            message: "Wrong Email",
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  },
  login_request: (details) => {
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
          email: details?.email?.replace?.("_login", ""),
        });

        if (check) {
          response = await db.collection(collections.TEMP).insertOne({
            ...details,
            expireAt: new Date(),
          });
        } else {
          reject({
            status: 422,
            message: "Wrong Email",
          });
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
  login_verify: (email, secret) => {
    return new Promise(async (resolve, reject) => {
      let response;
      try {
        let already = await db.collection(collections.USERS).findOne({
          email: email?.replace?.("_login", ""),
        });

        if (already) {
          let temp = await db.collection(collections.TEMP).findOne({
            email,
            secret,
          });

          if (temp) {
            response = await db.collection(collections.USERS).findOne({
              email: email?.replace?.("_login", ""),
            });
          } else {
            reject({ status: 422, message: "Wrong Verification Details" });
          }
        } else {
          reject({
            status: 422,
            message: "Wrong Email",
          });
        }
      } catch (err) {
        reject(err);
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
  edit_profile: ({ email, number, ...details }, userId) => {
    return new Promise(async (resolve, reject) => {
      delete details?.OTP;
      delete details?.avatar;

      try {
        await db
          .collection(collections.USERS)
          .createIndex({ email: 1 }, { unique: true });
        await db
          .collection(collections.USERS)
          .createIndex({ number: 1 }, { unique: true });

        await db.collection(collections.USERS).updateOne(
          {
            _id: new ObjectId(userId),
          },
          {
            $set: {
              ...details,
            },
          }
        );

        if (email) {
          await db.collection(collections.USERS).updateOne(
            {
              _id: new ObjectId(userId),
            },
            {
              $set: {
                email: email?.toLowerCase?.(),
              },
            }
          );
        }

        if (number) {
          await db.collection(collections.USERS).updateOne(
            {
              _id: new ObjectId(userId),
            },
            {
              $set: {
                number,
              },
            }
          );
        }

        resolve(true);
      } catch (err) {
        if (err?.code === 11000) {
          reject({
            status: 422,
            message: "Email or Number SomeOne Already Used",
          });
        }
      }
    });
  },
  edit_request: (secret, userId, { email, number }) => {
    return new Promise(async (resolve, reject) => {
      let res;

      try {
        await db
          .collection(collections.TEMP)
          .createIndex({ expireAt: 1 }, { expireAfterSeconds: 3600 });

        let email_already = await db.collection(collections.USERS).findOne({
          email: email?.toLowerCase?.(),
          _id: {
            $ne: new ObjectId(userId),
          },
        });

        let number_already = await db.collection(collections.USERS).findOne({
          number,
          _id: {
            $ne: new ObjectId(userId),
          },
        });

        if (!email_already && !number_already) {
          res = await db.collection(collections.TEMP).insertOne({
            _id: new ObjectId(userId),
            secret,
          });
        } else {
          if (email_already) {
            reject({
              status: 422,
              message: "Email Already Used",
            });
          } else if (number_already) {
            reject({
              status: 422,
              message: "Number Already Used",
            });
          }
        }
      } catch (err) {
        if (err?.code === 11000) {
          res = await db
            .collection(collections.TEMP)
            .findOneAndUpdate(
              {
                _id: new ObjectId(userId),
              },
              {
                $set: {
                  secret,
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
        if (res) {
          resolve(res);
        }
      }
    });
  },
  edit_profile_verify: ({ userId, OTP }) => {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await db.collection(collections.TEMP).findOne({
          _id: new ObjectId(userId),
          secret: OTP,
        });

        if (res) {
          await db.collection(collections.TEMP).deleteOne({
            _id: new ObjectId(userId),
          });
          resolve(res);
        } else {
          reject({ status: 422, message: "Wrong Verification Details" });
        }
      } catch (err) {
        reject(err);
      }
    });
  },
};
