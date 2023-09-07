import group from "../../helper/group.js";

export default (socket, io) => {
    socket.on("group message", async (data, callback) => {
        if (data?.groupId?.length === 24) {
            try {
                let res = await group?.newMsg(data?.groupId, {
                    ...data?.chat,
                    from: data?.userId,
                    read: []
                });

                if (res) {
                    io.to(data?.groupId).emit("chat message", {
                        ...data?.chat,
                        from: data?.userId,
                        user_name: data?.user_name,
                        group: data?.groupId,
                        profile: data?.profile,
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
}