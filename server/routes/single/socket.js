import chat from "../../helper/chat.js";

export default (socket, io) => {
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
                        read: data?.chatId == data?.userId ? true : undefined
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

    socket.on("read msg", async (data) => {
        if (data?.chatId?.length === 24) {
            try {
                let sockets = await chat?.getSocketIdTo?.(data?.chatId);

                await chat?.readMsgs(data?.chatId, data?.userId)

                if (sockets?.ids?.length > 0 && data?.chatId !== data?.userId) {
                    io.to(sockets?.ids).emit("read msg", {
                        to: data?.userId,
                        match: `${data?.userId}${data?.chatId}`
                    })
                }
            } catch (err) {
                console.log("error occured")
            }
        }
    })
}