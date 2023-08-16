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
        let dir = `./files/single_chat/${req?.body?.userId}/${req?.body?.chatId}`;

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
        cb(null, `${req?.body?.id}_${file.originalname}`);
      },
    }),
  }),
};
