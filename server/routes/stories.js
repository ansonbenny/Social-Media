import jwt from "jsonwebtoken";
import user from "../helper/user.js";
import { Router } from "express";
import multer from "../multer/index.js";
import files from "../helper/files.js";

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

    router.post("/new_storie", CheckLogged, async (req, res) => {
        try {
            // socket emit for own id for reload stories
            // setTimeout for delete file
            // expireAtSeconds for delete document from db
        } catch (err) {

        }
    })
}