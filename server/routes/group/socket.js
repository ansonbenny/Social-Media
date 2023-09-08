import group from "../../helper/group.js";

export default (socket, io) => {
    socket.on("group message", async (data, callback) => {
        if (data?.groupId?.length === 24) {
            try {
                let res = await group?.newMsg(data?.groupId, {
                    ...data?.chat,
                    from: data?.user?._id,
                    read: []
                });

                if (res) {
                    io.to(data?.groupId).emit("chat message", {
                        ...data?.chat,
                        from: data?.user?._id,
                        user_name: data?.user?.name,
                        group: data?.groupId,
                        profile: data?.user?.img,
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
                message: "Wrong Group Id",
            });
        }
    });

    socket.on("read group msg", async (data) => {
        if (data?.groupId?.length === 24) {
            try {
                await group?.readMsgs(data?.groupId, data?.userId)

                io.to(data?.groupId).emit("read group msg", {
                    from: data?.groupId,
                    to: data?.userId
                })
            } catch (err) {
                console.log("error occured")
            }
        }
    })
}