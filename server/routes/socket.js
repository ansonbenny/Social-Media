import chat from "../helper/chat.js";
import jwt from "jsonwebtoken";
import user from "../helper/user.js";

export default (app, io) => {
  io.use((socket, next) => {
    const { token = null } = socket?.request?.cookies;

    jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
      if (decode?._id?.length === 24) {
        try {
          let userData = await user.get_user(decode?._id);

          if (userData) {
            next();
          }
        } catch (err) {
          let error = new Error("user not logged");

          error.data = {
            status: 405,
            message: err ? err : "user not logged",
          };

          next(error);
        }
      } else {
        let error = new Error("user not logged");

        error.data = {
          status: 405,
          message: err ? err : "user not logged",
        };

        next(error);
      }
    });
  });

  io.on("connection", (socket) => {
    socket.on("user", async (_id) => {
      await chat?.addSocketId?.(_id, socket.id)?.catch?.(() => {});
    });

    socket.on("chat message", async (data, callback) => {
      if (data?.chatId?.length === 24) {
        try {
          let user_socket = await chat?.getSocketId?.(data?.chatId);

          let res = await chat?.newMsg({
            users:
              data?.chatId === data?.userId
                ? data?.userId
                : [data.chatId, data?.userId],
            chat: {
              ...data?.chat,
              from: data?.userId,
            },
          });

          if (
            res &&
            user_socket &&
            user_socket?._id?.toString?.() !== data?.userId
          ) {
            io.to(user_socket?.socketId).emit("chat message", {
              ...data?.chat,
              from: data?.userId,
            });
          }

          callback(undefined, {
            status: 200,
          });
        } catch (err) {
          callback({
            status: 500,
            message: err ? err : "something went wrong",
          });
        }
      } else {
        callback({
          status: 500,
          message: "Wrong Chat Id",
        });
      }
    });

    socket.on("disconnect", async () => {
      await chat?.removeSocketId?.(socket.id)?.catch?.(() => {});
    });
  });

  app.get("/test", (req, res) => {});
};
