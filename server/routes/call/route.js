import { Router } from "express";
import user from "../../helper/user.js";
import jwt from 'jsonwebtoken'
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
    app.use("/api/call", router);

    router.post("/request", CheckLogged, async (req, res) => {
        try {
            let response = await _private.getSocketId(req?.body?.to, req?.body?.userId)

            io.to(response?.ids).emit("call user", {
                from_name: response?.name,
                from: req?.body?.userId,
                ...req?.body
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

    router.post("/attend", CheckLogged, async (req, res) => {
        try {
            let response = await _private.getSocketId(req?.body?.to, req?.body?.userId)

            io.to(response?.ids).emit("call attend", {
                from: req?.body?.userId,
                to: req?.body?.to
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

    router.delete("/cancel", CheckLogged, async (req, res) => {
        try {
            let response = await _private.getSocketId(req?.body?.to, req?.body?.userId)

            io.to(response?.ids).emit("call cancel", {
                from: req?.body?.userId,
                to: req?.body?.to
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
}