import { ObjectId } from "mongodb";
import multer from "multer";
import fs from "node:fs/promises";
//import path from "node:path";

export default {
  profile: multer?.({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        let dir = `./files/profiles/`;

        try {
          await fs?.access(dir);

          // for (const files of await fs.readdir(dir)) {
          //   await fs.unlink(path.join(dir, files));
          // }
        } catch (err) {
          await fs?.mkdir(dir, {
            recursive: true,
          });
        }

        cb(null, dir);
      },
      filename: (req, file, cb) => {
        cb(null, `${req?.query?.userId}.png`);
      },
    }),
  }),
  share_user: multer?.({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        let dir = `./files/private_chat/${req?.body?.userId}/${req?.body?.chatId}`;

        try {
          await fs?.access(dir);
        } catch (err) {
          await fs?.mkdir(dir, {
            recursive: true,
          });
        }

        cb(null, dir);
      },
      filename: (req, file, cb) => {
        cb(null, `${Date?.now()?.toString?.(16)}_${file.originalname}`);
      },
    }),
  }),
  group_logo: multer?.({
    storage: multer?.diskStorage({
      destination: async (req, file, cb) => {

        let dir = './files/groups_logo'

        if (!req?.query?._id) {
          req.query._id = new ObjectId()?.toHexString?.()
        }

        try {
          await fs?.access(dir);
        } catch (err) {
          await fs?.mkdir(dir, {
            recursive: true,
          });
        }

        cb(null, dir)
      },
      filename: (req, file, cb) => {
        cb(null, `${req?.query?._id}.png`)
      }
    })
  }),
  share_group: multer?.({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        req.body.user = JSON.parse(req?.body?.user)

        let dir = `./files/group_chat/${req?.body?.groupId}/${req?.body?.user?._id}`;

        try {
          await fs?.access(dir);
        } catch (err) {
          await fs?.mkdir(dir, {
            recursive: true,
          });
        }

        cb(null, dir);
      },
      filename: (req, file, cb) => {
        cb(null, `${Date?.now()?.toString?.(16)}_${file.originalname}`);
      },
    }),
  }),
  share_storie:multer?.({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        let dir = `./files/stories/${req?.query?.userId}`;

        try {
          await fs?.access(dir);
        } catch (err) {
          await fs?.mkdir(dir, {
            recursive: true,
          });
        }

        cb(null, dir);
      },
      filename: (req, file, cb) => {
        cb(null, `${Date?.now()?.toString?.(16)}_${file.originalname}`);
      },
    }),
  }),
};
