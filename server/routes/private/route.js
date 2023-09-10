import chat from "../../helper/private.js";
import jwt from "jsonwebtoken";
import user from "../../helper/user.js";
import { Router } from "express";
import multer from "../../multer/index.js";
import files from "../../helper/files.js";

const router = Router();

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
    // config for express route
    app.use("/api/chat-single", router);

    router.get("/user_details", CheckLogged, async (req, res) => {
        try {
            let response = await chat.get_user(req?.query)

            res.status(200).json({
                status: 200,
                message: "success",
                data: response
            })
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: err
            })
        }
    })

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

    router.get("/recent_users", CheckLogged, async (req, res) => {
        const { userId = null } = req?.query

        try {
            const total_unreaded = await chat.get_total_unreaded(userId)

            const users = await chat.get_recent_users(userId)

            res.status(200).json({
                status: 200,
                message: "Success",
                data: {
                    items: users,
                    total: total_unreaded
                }
            })
        } catch (err) {
            res.status(500).json({
                status: 200,
                message: err
            })
        }
    })

    router.get("/recent_users_more", CheckLogged, async (req, res) => {
        const { userId = null, offset } = req?.query

        try {
            const users = await chat.get_recent_users(userId, offset)

            res.status(200).json({
                status: 200,
                message: "Success",
                data: {
                    items: users
                }
            })
        } catch (err) {
            res.status(500).json({
                status: 200,
                message: err
            })
        }
    })

    router.get('/search_users', CheckLogged, async (req, res) => {
        try {
            if (req?.query?.search?.length >= 1) {
                const response = await chat.searchUser(req?.query)

                res.status(200).json({
                    status: 200,
                    message: "Success",
                    data: {
                        items: response
                    }
                })
            } else {
                const total_unreaded = await chat.get_total_unreaded(req?.query?.userId)

                const users = await chat.get_recent_users(req?.query?.userId)

                res.status(200).json({
                    status: 200,
                    message: "Success",
                    data: {
                        recent: true,
                        items: users,
                        total: total_unreaded
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

    router.post("/share_file", CheckLogged, multer?.share_user?.single('file'), async (req, res) => {
        try {

            const chat_msg = {
                date: req?.body?.date,
                id: Date?.now()?.toString(16),
                from: req?.body?.userId,
                file: {
                    ...req?.file,
                    url: `/${req?.file?.path}`,
                    type: req?.file?.mimetype
                },
            }

            let sockets = await chat?.getSocketId?.(req?.body?.chatId, req?.body?.userId);

            let response = await chat?.newMsg({
                users: [req?.body?.chatId, req?.body?.userId],
                chat: {
                    ...chat_msg,
                    read: req?.body?.chatId == req?.body?.userId ? true : undefined
                },
            });

            if (response && sockets?.ids?.length > 0) {
                io.to(sockets?.ids).emit("chat message", {
                    ...chat_msg,
                    user: sockets?.name || "",
                    match:
                        req?.body?.chatId == req?.body?.userId
                            ? req?.body?.userId
                            : `${req?.body?.userId}${req?.body?.chatId}`,
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

    router.get('/get_media', CheckLogged, async (req, res) => {
        try {
            let response = await chat.getMediaSigleChat(req?.query)

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
            let sockets = await chat?.getSocketId?.(req?.body?.chatId, req?.body?.userId);

            let response = await chat?.delete_msg_user({
                users: [req?.body?.chatId, req?.body?.userId],
                id: req?.body?.msg_id,
                from: req?.body?.userId,
                date: req?.body?.date
            })

            if (response?.modifiedCount > 0) {
                if (req?.body?.file) {
                    files?.delete_file(req?.body?.file?.url)
                }

                if (sockets?.ids?.length > 0) {
                    io.to(sockets?.ids).emit("chat delete", {
                        id: req?.body?.msg_id,
                        from: req?.body?.userId,
                        file: req?.body?.file ? true : false,
                        match:
                            req?.body?.chatId == req?.body?.userId
                                ? req?.body?.userId
                                : `${req?.body?.userId}${req?.body?.chatId}`,
                    });
                }
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
            let sockets = await chat?.getSocketId?.(req?.body?.chatId, req?.body?.userId);

            let response = await chat?.delete_chat_private([req?.body?.chatId, req?.body?.userId])

            if (response?.deletedCount >= 1) {
                files?.delete_folder(`/files/private_chat/${req?.body?.chatId}/${req?.body?.userId}`)
                files?.delete_folder(`/files/private_chat/${req?.body?.userId}/${req?.body?.chatId}`)

                if (sockets?.ids?.length > 0) {
                    io.to(sockets?.ids).emit("chat delete", {
                        empty: true,
                        match:
                            req?.body?.chatId == req?.body?.userId
                                ? req?.body?.userId
                                : `${req?.body?.userId}${req?.body?.chatId}`,
                    });
                }
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
}