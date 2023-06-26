import { Router } from "express";
import { sendMail } from "../mail/index.js";
import { FiveDigit } from "../utils/index.js";
import jwt from "jsonwebtoken";
import user from "../helper/user.js";

const router = Router();

const CheckLogged = (req, res, next) => {
  const { token = null } = req?.cookies;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
    if (decode?._id?.length === 24) {
      try {
        let userData = await user.get_user(decode?._id);

        if (userData) {
          res.status(208).json({
            status: 208,
            message: "Already Logged",
            data: userData,
          });
        }
      } catch (err) {
        console.log(err);
        res.clearCookie("token");
        next();
      }
    } else if (err) {
      console.log(`Error : ${err?.name}`);
      res.clearCookie("token");
      next();
    } else {
      res.clearCookie("token");
      next();
    }
  });
};

router.get("/checkLogged", CheckLogged, (req, res) => {
  res.status(405).json({
    status: 405,
    message: "User not logged",
  });
});

router.post("/register", CheckLogged, async (req, res) => {
  let { name, email, number, google } = req.body;
  if (number && name) {
    if (google) {
      let response;
      try {
        let googleCheck = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${google}`,
            },
          }
        );

        if (
          googleCheck?.data?.email &&
          googleCheck?.data?.email?.toLowerCase() === email?.toLowerCase()
        ) {
          response = await user.register_direct({
            name,
            email: email?.toLowerCase(),
            number,
          });
        } else {
          res.status(500).json({
            status: 500,
            message: "Something Wrong",
          });
        }
      } catch (err) {
        if (err?.status) {
          res.status(err.status).json(err);
        } else {
          res.status(500).json({
            status: 500,
            message: err,
          });
        }
      } finally {
        if (response) {
          res.status(200).json({
            status: 200,
            google: true,
            message: "Successfully Registered",
          });
        }
      }
    } else {
      var validRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

      if (email?.match(validRegex)) {
        email = email.toLowerCase();

        let secret = FiveDigit?.();

        console.log(secret);

        let response;

        try {
          response = await user.register_request({
            name,
            email: `${email}_register`,
            number,
            secret,
          });
        } catch (err) {
          if (err?.status) {
            res.status(err.status).json(err);
          } else {
            res.status(500).json({
              status: 500,
              message: err,
            });
          }
        } finally {
          if (response?._id) {
            sendMail(
              {
                to: email,
                subject: `Soft Chat Register Verification Code`,
                text: secret,
              },
              (err, done) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(`Email sent: ${done.response}`);
                }
              }
            );

            res.status(200).json({
              status: 200,
              message: "Register Request Sented",
            });
          }
        }
      } else {
        res.status(422).json({
          status: 422,
          message: "Enter email",
        });
      }
    }
  } else {
    res.status(422).json({
      status: 422,
      message: "Fill Required Fields",
    });
  }
});

router.post("/register-verify", CheckLogged, async (req, res) => {
  const { email, secret } = req.body;

  if (email && secret) {
    let response;
    try {
      response = await user.register_verify(`${email}_register`, secret);
    } catch (err) {
      if (err?.status) {
        res.status(err.status).json(err);
      } else {
        res.status(500).json({
          status: 500,
          message: err,
        });
      }
    } finally {
      if (response) {
        res.status(200).json({
          status: 200,
          message: "Register Completed",
        });
      }
    }
  } else {
    res.status(422).json({
      status: 422,
      message: "Wrong Verification Details",
    });
  }
});

export default router;
