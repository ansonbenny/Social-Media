import chat from "../../helper/chat.js";
import jwt from "jsonwebtoken";
import user from "../../helper/user.js";
import { Router } from "express";
import multer from "../../multer/index.js";

const router = Router();

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
    app.use("/api/chat-single", router);

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

    router.post("/share_file", CheckLogged, multer?.share_user?.single('file'), async (req, res) => {
        try {
            let sockets = await chat?.getSocketId?.(req?.body?.chatId, req?.body?.userId);

            let response = await chat?.newMsg({
                users: [req?.body?.chatId, req?.body?.userId],
                chat: {
                    id: req?.body?.id,
                    date: req?.body?.date,
                    file: {
                        ...req?.file,
                        url: `/${req?.file?.path}`,
                        type: req?.file?.mimetype
                    },
                    from: req?.body?.userId,
                    read: req?.body?.chatId == req?.body?.userId ? true : undefined
                },
            });

            if (response && sockets?.ids?.length > 0) {
                io.to(sockets?.ids).emit("chat message", {
                    id: req?.body?.id,
                    date: req?.body?.date,
                    file: {
                        ...req?.file,
                        url: `/${req?.file?.path}`,
                        type: req?.file?.mimetype
                    },
                    from: req?.body?.userId,
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
}