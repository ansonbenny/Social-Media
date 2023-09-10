import chat from "../../helper/private.js";

export default (socket, io) => {
    socket.on("user status", async ({ from, to, status }) => {
        try {
            let sockets = await chat?.getSocketIdTo?.(to)

            if (sockets?.ids) {
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
                const chat_msg = {
                    msg: data?.msg,
                    date: data?.date,
                    id: Date?.now()?.toString(16),
                    from: data?.userId,
                }

                let sockets = await chat?.getSocketId?.(data?.chatId, data?.userId);

                let res = await chat?.newMsg({
                    users: [data?.chatId, data?.userId],
                    chat: {
                        ...chat_msg,
                        read: data?.chatId == data?.userId ? true : undefined
                    },
                });

                if (res && sockets?.ids?.length > 0) {
                    io.to(sockets?.ids).emit("chat message", {
                        ...chat_msg,
                        user: sockets?.name || "",
                        match:
                            data?.chatId == data?.userId
                                ? data?.userId
                                : `${data?.userId}${data?.chatId}`,
                    });
                }

                callback(undefined, chat_msg);
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
                let sockets = await chat?.getSocketId?.(data?.chatId, data?.userId);

                await chat?.readMsgs(data?.chatId, data?.userId)

                if (sockets?.ids?.length > 0 && data?.chatId !== data?.userId) {
                    io.to(sockets?.ids).emit("read msg", {
                        to: data?.userId,
                        from: data?.chatId,
                        match: `${data?.userId}${data?.chatId}`
                    })
                }
            } catch (err) {
                console.log("error occured")
            }
        }
    })
}