import jwt from "jsonwebtoken";
import user from "../../helper/user.js";
import { Router } from "express";
import multer from "../../multer/index.js";
import group from "../../helper/group.js";
import _private from "../../helper/private.js";

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

    router.post('/create_group', multer.group_logo.single("file"), CheckLogged, async (req, res) => {
        try {
            let response = await group.create_group({
                ...req?.body, logo: {
                    ...req?.file,
                    url: `/${req?.file?.path}`
                }
            })

            let sockets = await _private.getSocketIdTo(req?.body?.userId)

            if (response) {
                io.to(sockets?.ids).emit("new group", {
                    ss: 'test'
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
}