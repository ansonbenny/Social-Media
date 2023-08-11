import chat from "../helper/chat.js";
import jwt from "jsonwebtoken";
import user from "../helper/user.js";
import { RouteSingle, SocketSingle } from "./single/index.js";

// express route middleware to check user is logged or not

export default (app, io) => {
  // variable for save online users
  let onlineUsers = []

  // socket io
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
      await chat?.addSocketId?.(_id, socket.id)?.catch?.(() => { });

      // adding to onlineUsers
      if (_id) {
        let user = onlineUsers?.find((obj) => obj?.userId == _id)

        if (user) {
          onlineUsers?.forEach((obj) => {
            if (obj?.userId == _id) {
              if (obj?.socketId?.length > 0) {
                if (!obj?.socketId?.includes?.(socket?.id)) {
                  obj.socketId = [...obj?.socketId, socket?.id]
                }
              } else {
                obj.socketId = [socket.id]
              }
            }
          })
        } else {
          onlineUsers.push({ userId: _id, socketId: [socket?.id] })
        }
      }

      // senting to users
      io.emit("all user status", onlineUsers)
    });

    SocketSingle(socket, io);


    socket.on("disconnect", async () => {
      await chat?.removeSocketId?.(socket.id)?.catch?.(() => { });

      // removeing from onlineUsers
      let user = onlineUsers?.find((obj) => {
        return obj?.socketId?.includes(socket?.id)
      })

      if (user?.socketId?.length > 1) {
        onlineUsers?.forEach((obj) => {
          if (obj?.userId == user?.userId) {
            obj.socketId = obj?.socketId?.filter?.((ids) => ids !== socket?.id)
          }
        })
      } else {
        onlineUsers = onlineUsers?.filter((obj) => obj?.userId !== user?.userId)
      }

      // senting to users
      io.emit("all user status", onlineUsers)
    });
  });

  // express routes
  RouteSingle(app, io)
};
