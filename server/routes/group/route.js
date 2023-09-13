import jwt from "jsonwebtoken";
import user from "../../helper/user.js";
import { Router } from "express";
import multer from "../../multer/index.js";
import group from "../../helper/group.js";
import _private from "../../helper/private.js";
import files from "../../helper/files.js";

const router = Router()

const CheckLogged = (req, res, next) => {
    const { token = null } = req?.cookies;

    jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
        if (decode?._id?.length === 24) {
            try {
                let userData = await user.get_user(decode?._id);

                if (userData) {
                    req.query.userId = userData?._id?.toString?.();
                    req.body.userId = userData?._id?.toString?.();
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
    app.use("/api/chat-group", router)

    router.post("/share_file", CheckLogged, multer?.share_group?.single('file'), async (req, res) => {
        try {
            const details = {
                id: Date?.now()?.toString(16),
                date: req?.body?.date,
                file: {
                    ...req?.file,
                    url: `/${req?.file?.path}`,
                    type: req?.file?.mimetype
                },
                from: req?.body?.user?._id,
            }

            let response = await group?.newMsg(req?.body?.groupId, {
                ...details,
                read: []
            });

            let group_data = await group?.get_group_details(req?.body?.groupId)

            if (response && group_data) {
                io.to(req?.body?.groupId).emit("chat message", {
                    ...details,
                    user_name: req?.body?.user?.name,
                    group: req?.body?.groupId,
                    profile: req?.body?.user?.img,
                    group_data
                });

                res.status(200).json({
                    status: 200,
                    message: 'Success'
                })
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: err
            })
        }
    })

    router.post('/create_group', CheckLogged, multer.group_logo.single("file"), async (req, res) => {
        req.body.img = {
            ...req?.file,
            url: `/${req?.file?.path}`
        }

        try {
            let response = await group.create_group(req?.body, req?.query)

            let sockets = await _private.getSocketIdTo(req?.query?.userId)

            if (response) {
                io.to(sockets?.ids).emit("new group", {
                    id: req?.query?._id,
                    details: req?.body
                })

                res.status(200).json({
                    status: 200,
                    message: "Success"
                })
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: err
            })
        }
    })

    router.get('/get_members', CheckLogged, async (req, res) => {
        try {
            let response = await group.get_members(req?.query)

            res.status(200).json({
                status: 200,
                message: "Success",
                data: response
            })
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: err
            })
        }
    })

    router.put('/edit_group', CheckLogged, multer.group_logo.single("file"), async (req, res) => {
        if (req?.file) {
            req.body.img = {
                ...req?.file,
                url: `/${req?.file?.path}`
            }
        }

        if (req?.body?.name?.length <= 0) {
            delete req?.body?.name
        }

        if (req?.body?.about?.length <= 0) {
            delete req?.body?.about
        }

        try {
            let response = await group.edit_group(req?.body, req?.query)

            if (response) {
                io.to(req?.query?._id).emit("edit group", {
                    id: req?.query?._id,
                    details: req?.body
                })

                res.status(200).json({
                    status: 200,
                    message: "Success"
                })
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: err
            })
        }
    })

    router.get('/get_media', CheckLogged, async (req, res) => {
        try {
            let response = await group.getMediaFiles(req?.query)

            res.status(200).json({
                status: 200,
                message: "Success",
                data: response,
            });
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: err ? err : "Something Went Wrong",
            });
        }
    })

    router.delete('/delete_msg', CheckLogged, async (req, res) => {
        try {
            let response = await group?.delete_msg({
                groupId: req?.body?.groupId,
                id: req?.body?.msg_id,
                from: req?.body?.userId,
                date: req?.body?.date
            })

            if (response?.modifiedCount > 0) {
                if (req?.body?.file) {
                    files?.delete_file(req?.body?.file?.url)
                }

                io.to(req?.body?.groupId).emit("group chat delete", {
                    id: req?.body?.msg_id,
                    from: req?.body?.userId,
                    file: req?.body?.file ? true : false,
                    group: req?.body?.groupId
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Success'
            })
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: err
            })
        }
    })

    router.delete('/delete_chat', CheckLogged, async (req, res) => {
        try {
            let response = await group?.delete_chat(req?.body)

            if (response?.deletedCount >= 1) {
                files?.delete_folder(`/files/group_chat/${req?.body?.groupId}`)

                files?.delete_file(`/files/groups_logo/${req?.body?.groupId}.png`)

                io.to(req?.body?.groupId).emit("group chat delete", {
                    empty: true,
                    group: req?.body?.groupId
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Success'
            })

        } catch (err) {
            res.status(500).json({
                status: 500,
                message: err
            })
        }
    })

    router.get('/get_friends_group_add', CheckLogged, async (req, res) => {
        try {
            let response = await group.get_friends_group_add?.(req?.query)

            res.status(200).json({
                status: 200,
                message: "Success",
                data: response
            })
        } catch (err) {
            res.status(500).json({
                status: 200,
                message: err
            })
        }
    })

    router.put('/add_member', CheckLogged, async (req, res) => {
        try {
            req.body.selected = req?.body?.selected?.map?.((obj) => obj?._id)

            let response = await group.add_member(req?.body)

            response?.users?.forEach((user) => {
                io.to(user?.socketId).emit("new group", response?.group)
            })

            io.to(response?.group?.id).emit("new group", response?.group)

            res.status(200).json({
                status: 200,
                message: "Success"
            })
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: err
            })
        }
    })

    router.delete('/exit_group/:id', CheckLogged, async (req, res) => {
        try {
            await group.exit_group(req?.params?.id, req?.query?.userId)

            io.to(req?.params?.id).emit("remove member", {
                id: req?.params?.id,
                userId: req?.query?.userId
            })

            res.status(200).json({
                status: 200,
                message: "Success"
            })
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: err
            })
        }
    })

    router.delete('/remove_member/:id', CheckLogged, async (req, res) => {
        try {
            await group.remove_member(req?.body, req?.query?.userId)

            io.to(req?.body?.groupId).emit("remove member", {
                id: req?.body?.groupId,
                userId: req?.body?.remove
            })

            res.status(200).json({
                status: 200,
                message: "Success"
            })
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: err
            })
        }
    })

    router.get('/get_group/:id', CheckLogged, async (req, res) => {
        if (req?.params?.id?.length == 24) {
            try {
                let response = await group.get_group(req?.params?.id, req?.query)

                res.status(200).json({
                    status: 200,
                    message: "Success",
                    data: response
                })
            } catch (err) {
                res.status(500).json({
                    status: 500,
                    message: err
                })
            }
        } else {
            res.status(404).json({
                status: 404,
                message: "Group Not Found",
            });
        }
    })

    router.get('/get_groups', CheckLogged, async (req, res) => {
        try {
            const total_unreaded = await group.get_total_unreaded(req?.query?.userId)

            const response = await group.get_groups(req?.query?.userId)

            res.status(200).json({
                status: 200,
                message: "Success",
                data: {
                    total: total_unreaded,
                    items: response
                }
            })
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: err
            })
        }
    })

    router.get('/recent_groups_more', CheckLogged, async (req, res) => {
        try {
            const response = await group.get_groups(req?.query?.userId, req?.query?.offset)

            res.status(200).json({
                status: 200,
                message: "Success",
                data: {
                    items: response
                }
            })
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: err
            })
        }
    })

    router.get('/get_groups_search', CheckLogged, async (req, res) => {
        try {
            if (req?.query?.search?.length >= 1) {
                const response = await group.get_groups_search(req?.query)

                res.status(200).json({
                    status: 200,
                    message: "Success",
                    data: {
                        items: response
                    }
                })
            } else {
                const total_unreaded = await group.get_total_unreaded(req?.query?.userId)

                const response = await group.get_groups(req?.query?.userId)

                res.status(200).json({
                    status: 200,
                    message: "Success",
                    data: {
                        recent: true,
                        total: total_unreaded,
                        items: response
                    }
                })
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: err
            })
        }
    })
}
