import chat from "../helper/chat.js";
import jwt from "jsonwebtoken";
import user from "../helper/user.js";
import { Router } from "express";

const router = Router();

// express route middleware to check user is logged or not
const CheckLogged = (req, res, next) => {
  const { token = null } = req?.cookies;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
    if (decode?._id?.length === 24) {
      try {
        let userData = await user.get_user(decode?._id);

        if (userData) {
          req.query.userId = userData?._id?.toString?.();
          next();
        }
      } catch (err) {
        res.clearCookie("token").status(405).json({
          status: 405,
          message: "User Not Logged",
        });
      }
    } else {
      console.log(err ? `Error : ${err?.name}` : "Something Went Wrong");

      res.clearCookie("token").status(405).json({
        status: 405,
        message: "User Not Logged",
      });
    }
  });
};

export default (app, io) => {
  // config for express route
  app.use("/api/chat", router);

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

    socket.on("user status", async ({ from, to, status }) => {
      try {
        let sockets = await chat?.getSocketIdTo?.(to)

        if (sockets?.ids?.length > 0) {
          io.to(sockets.ids).emit("user status", {
            from,
            status
          })
        }
      } catch (err) {
        console.log("something went wrong")
      }
    })

    socket.on("chat message", async (data, callback) => {
      if (data?.chatId?.length === 24) {
        try {
          let sockets = await chat?.getSocketId?.(data?.chatId, data?.userId);

          let res = await chat?.newMsg({
            users: [data?.chatId, data?.userId],
            chat: {
              ...data?.chat,
              from: data?.userId,
            },
          });

          if (res && sockets?.ids?.length > 0) {
            io.to(sockets?.ids).emit("chat message", {
              ...data?.chat,
              from: data?.userId,
              user: sockets?.name || "",
              match:
                data?.chatId == data?.userId
                  ? data?.userId
                  : `${data?.userId}${data?.chatId}`,
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
  router.get("/userChat/:id", CheckLogged, async (req, res) => {
    if (req?.params?.id?.length == 24) {
      try {
        let response = await chat.getUserChats(req?.params?.id, req?.query);

        res.status(200).json({
          status: 200,
          message: "Success",
          data: response,
        });
      } catch (err) {
        if (err?.status) {
          res.status(err?.status).json({
            status: err?.status,
            message: err?.message ? err?.message : "Something Went Wrong",
          });
        } else {
          res.status(500).json({
            status: 500,
            message: err ? err : "Something Went Wrong",
          });
        }
      }
    } else {
      res.status(404).json({
        status: 404,
        message: "User Not Found",
      });
    }
  });

  router.get("/users_chat", CheckLogged, async (req, res) => {
    const { userId = null } = req?.query

    try {
      const chats = await chat.get_users_chat(userId)

      res.status(200).json({
        status: 200,
        message: "Success",
        data: chats
      })
    } catch (err) {
      res.status(500).json({
        status: 200,
        message: err
      })
    }
  })
};
