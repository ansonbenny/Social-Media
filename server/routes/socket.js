import chat from "../helper/private.js";
import jwt from "jsonwebtoken";
import user from "../helper/user.js";
import { RoutePrivate, SocketPrivate } from "./private/index.js";
import { RouteGroup, SocketGroup } from "./group/index.js";

// express route middleware to check user is logged or not

export default (app, io) => {
  // closure for online users
  const onlineUsers = () => {
    let users = []

    const getOnline = () => {
      return users
    }

    const onConnect = (socketId, _id) => {
      let user = users?.find((obj) => obj?.userId == _id)

      if (user) {
        users?.forEach((obj) => {
          if (obj?.userId == _id) {
            if (obj?.socketId?.length > 0) {
              if (!obj?.socketId?.includes?.(socketId)) {
                obj.socketId = [...obj?.socketId, socketId]
              }
            } else {
              obj.socketId = [socketId]
            }
          }
        })
      } else {
        users.push({ userId: _id, socketId: [socketId] })
      }
    }

    const onDisconnect = (socketId) => {
      let user = users?.find((obj) => {
        return obj?.socketId?.includes(socketId)
      })

      if (user?.socketId?.length > 1) {
        users?.forEach((obj) => {
          if (obj?.userId == user?.userId) {
            obj.socketId = obj?.socketId?.filter?.((ids) => ids !== socketId)
          }
        })
      } else {
        users = users?.filter((obj) => obj?.userId !== user?.userId)
      }
    }

    return { getOnline, onConnect, onDisconnect }
  }

  const { getOnline, onConnect, onDisconnect } = onlineUsers?.()

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
        onConnect(socket?.id, _id)
      }

      // senting to users
      io.emit("all user status", getOnline?.())
    });

    // socket io routes / callback
    SocketPrivate(socket, io);

    SocketGroup(socket, io)

    socket.on("disconnect", async () => {
      await chat?.removeSocketId?.(socket.id)?.catch?.(() => { });

      // removeing from onlineUsers
      onDisconnect(socket?.id)

      // senting to users
      io.emit("all user status", getOnline?.())
    });
  });

  // express routes
  RoutePrivate(app, io, getOnline)

  RouteGroup(app, io)
};
