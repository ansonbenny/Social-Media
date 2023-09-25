import jwt from "jsonwebtoken";
import user from "../helper/user.js";
import _private from '../helper/private.js'
import { Router } from "express";
import multer from "../multer/index.js";
import files from "../helper/files.js";
import story from "../helper/story.js";

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
    app.use('/api/stories/', router);

    router.post("/new_story", CheckLogged, multer.share_storie.single('file'), async (req, res) => {
        let expire = new Date();

        expire.setTime(expire.getTime() + (24 * 60 * 60 * 1000))

        setTimeout(() => {
            files.delete_file(`/${req?.file?.path}`)
        }, expire - new Date())

        try {
            await story.add_story({
                ...req?.file,
                url: `/${req?.file?.path}`,
                userId: req?.query?.userId
            })

            let socket = await _private.getSocketIdTo(req?.query?.userId)

            io.to(socket?.ids)?.emit("story update", true)

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

    router.get("/get_stories/:id", CheckLogged, async (req, res) => {
        try {
            let response = await story.get_stories(req?.params?.id, req?.query?.userId, req?.query?.offset)

            res.status(200).json({
                status: 200,
                message: "Success",
                data: response
            })
        } catch (err) {
            res.status(err?.status || 500).json({
                status: err?.status || 500,
                message: err?.message || err
            })
        }
    })

    router.delete("/delete_story", CheckLogged, async (req, res) => {
        try {
            await story.delete_story(req?.body)

            files?.delete_file(req?.body?.url)

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

    router.get("/get_users", CheckLogged, async (req, res) => {
        try {
            let response = await story.get_users(req?.query)

            res.status(200).json({
                status: 200,
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
}