import group from "../../helper/group.js";

export default (socket, io) => {
    socket.on("group message", async (data, callback) => {
        if (data?.groupId?.length === 24) {
            try {
                const chat_msg = {
                    msg: data?.msg,
                    date: data?.date,
                    id: Date?.now()?.toString(16),
                    from: data?.user?._id,
                }

                let res = await group?.newMsg(data?.groupId, {
                    ...chat_msg,
                    read: []
                });

                let group_data = await group?.get_group_details(data?.groupId)

                if (res && group_data) {
                    io.to(data?.groupId).emit("chat message", {
                        ...chat_msg,
                        user_name: data?.user?.name,
                        group: data?.groupId,
                        profile: data?.user?.img,
                        group_data
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