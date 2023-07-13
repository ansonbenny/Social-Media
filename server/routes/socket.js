import chat from "../helper/chat.js";
import jwt from "jsonwebtoken";
import user from "../helper/user.js";

export default (app, io) => {
  /*
  .use((socket, next) => {
    let token;

    if (socket?.request?.headers?.cookie) {
      const cookie = cookie_json.parse(socket?.request?.headers?.cookie);

      token = cookie?.token;
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
      console.log(err, decode);
      if (decode?._id?.length === 24) {
        try {
          let userData = await user.get_user(decode?._id);

          if (userData) {
            console.log(userData);
            next();
          }
        } catch (err) {
          socket.emit("response", {
            status: 405,
            message: err ? err : "user not logged",
          });
        }
      } else if (err) {
        socket.emit("response", {
          status: 405,
          message: err ? err : "user not logged",
        });
      } else {
        socket.emit("response", {
          status: 405,
          message: "user not logged",
        });
      }
    });
  })
  */

  io.on("connection", (socket) => {
    // to check user is logged or not
    socket.use((packet, next) => {
      let token;

      // if (socket?.request?.headers?.cookie) {
      //   const cookie = cookie_json.parse(socket?.request?.headers?.cookie);
      //   token = cookie?.token;
      // }

      // console.log(token);

      next();

      /*
      let token;
      
      if (socket?.request?.headers?.cookie) {
        const cookie = cookie_json.parse(socket?.request?.headers?.cookie);
        token = cookie?.token;
      }

      jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
        if (decode?._id?.length === 24) {
          try {
            let userData = await user.get_user(decode?._id);
            if (userData) {
              if (packet?.[1]) {
                packet[1] = {
                  ...packet[1],
                  userId: userData?._id?.toString?.(),
                };

                console.log("packet");
              }
              next();
            }
          } catch (err) {
            socket.emit("response", {
              status: 405,
              message: err ? err : "user not logged",
            });
          }
        } else if (err) {
          socket.emit("response", {
            status: 405,
            message: err ? err : "user not logged",
          });
        } else {
          socket.emit("response", {
            status: 405,
            message: "user not logged",
          });
        }
      });
      */
    });

    socket.on("user", async (_id) => {
      await chat?.addSocketId?.(_id, socket.id)?.catch?.(() => {});
    });

    socket.on("chat message", async (data) => {
      console.log(socket.request.cookies?.token);

      try {
        let user_socket = await chat?.getSocketId?.(data?.chatId);

        let res = await chat?.newMsg({
          users: [data.chatId, data?.userId],
          chat: {
            ...data?.chat,
            from: data?.userId,
          },
        });

        if (res && user_socket && user_socket?._id !== data?.userId) {
          io.to(user_socket?.socketId).emit("chat message", {
            ...data?.chat,
            from: data?.userId,
          });
        }

        socket.emit("response", {
          message: "Success",
        });
      } catch (err) {
        socket.emit("response", {
          error: true,
          message: err ? err : "something went wrong",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("disconnect");
    });
  });

  app.get("/test", (req, res) => {});
};
