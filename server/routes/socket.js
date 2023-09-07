import chat from "../helper/private.js";
import group from "../helper/group.js";
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
            obj.socketId = socketId
          }
        })
      } else {
        users.push({ userId: _id, socketId })
      }
    }

    const onDisconnect = (socketId) => {
      users = users?.filter((obj) => obj?.socketId !== socketId)
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
      let previous = await chat?.addSocketId?.(_id, socket.id)?.catch?.(() => { });

      let groups = await group?.get_user_group_ids?.(_id)?.catch?.(() => { })

      // adding to onlineUsers
      if (_id) {
        onConnect(socket?.id, _id)
      }

      if (previous?.socketId) {
        io.to(previous?.socketId).emit("close_window", socket.id)
      }

      // for group chat
      if (groups?.[0]) {
        socket.join(groups)
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
  RoutePrivate(app, io)

  RouteGroup(app, io)
};
