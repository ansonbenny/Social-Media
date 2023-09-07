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

    // create api for members & media
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
            // get recent based groups & total unreaded msgs
            let response = await group.get_groups(req?.query?.userId)

            res.status(200).json({
                status: 200,
                message: "Success",
                data: {
                    total: 0,
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

// recent groups // memebers need update [add/remove] // media send // remove // in details
// remove member with socket, add member with socket