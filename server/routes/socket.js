import chat from "../helper/private.js";
import group from "../helper/group.js";
import jwt from "jsonwebtoken";
import user from "../helper/user.js";
import { RoutePrivate, SocketPrivate } from "./private/index.js";
import { RouteGroup, SocketGroup } from "./group/index.js";
import { RouteCall, SocketCall } from "./call/index.js";
import RouteStories from './stories.js'

export default (app, io) => {

  // socket io
  // middleware to check user is logged or not
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

      if (previous?.socketId) {
        io.to(previous?.socketId).emit("close_window", socket.id)
      }

      // for group chat
      if (groups?.[0]) {
        socket.join(groups)
      }

      // senting to users
      io.emit("all user status", {
        _id: previous?._id?.toString?.()
      })
    });

    // socket io routes / callback
    SocketPrivate(socket, io);

    SocketGroup(socket, io);

    SocketCall(socket, io);

    socket.on("disconnect", async () => {
      let previous = await chat?.removeSocketId?.(socket.id)?.catch?.(() => { });

      // senting to users
      io.emit("all user status", {
        _id: previous?._id?.toString?.(),
        offline: true
      })
    });
  });

  // express routes
  RoutePrivate(app, io)

  RouteGroup(app, io)

  RouteCall(app, io)

  RouteStories(app, io)
};
