import { Router } from "express";
import { sendMail } from "../mail/index.js";
import { FiveDigit } from "../utils/index.js";
import multer from "../multer/index.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import user from "../helper/user.js";
import fs from "fs";

const router = Router();

const CheckLogged = (req, res, next) => {
  const { token = null } = req?.cookies;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
    if (decode?._id?.length === 24) {
      try {
        let userData = await user.get_user(decode?._id);

        if (userData) {
          if (req?.query?.next) {
            req.query.userId = userData?._id?.toString?.();
            req.query.email = userData?.email?.toLowerCase?.();
            next();
          } else {
            res.status(208).json({
              status: 208,
              message: "Already Logged",
              data: userData,
            });
          }
        }
      } catch (err) {
        console.log(err);
        if (req?.query?.next) {
          res.clearCookie("token").status(405).json({
            status: 405,
            message: "User Not Logged",
          });
        } else {
          res.clearCookie("token");
          next();
        }
      }
    } else {
      console.log(err ? `Error : ${err?.name}` : "Something Went Wrong");

      if (req?.query?.next) {
        res.clearCookie("token").status(405).json({
          status: 405,
          message: "User Not Logged",
        });
      } else {
        res.clearCookie("token");
        next();
      }
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
  if (number?.length === 10 && name) {
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
          googleCheck?.data?.email?.toLowerCase?.() === email?.toLowerCase?.()
        ) {
          response = await user.register_direct({
            name,
            email: email?.toLowerCase?.(),
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
            message: "Successfully Registered",
            data: {
              google: true,
            },
          });
        }
      }
    } else {
      var validRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

      if (email?.match(validRegex)) {
        email = email?.toLowerCase?.();

        let secret = FiveDigit?.();

        let response;

        try {
          response = await user.register_request({
            email: `${email}_register`,
            number,
            secret,
          });

          if (response) {
            await sendMail(
              {
                to: email,
                subject: `Soft Chat Register Verification Code`,
                text: secret,
              })

            res.status(200).json({
              status: 200,
              message: "Register Otp Sented",
              data: {
                otp: true,
              },
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
      message: "Enter correct data.",
    });
  }
});

router.post("/register-verify", CheckLogged, async (req, res) => {
  let { email, name, number, OTP } = req.body;

  email = email?.toLowerCase?.();

  if (number?.length === 10) {
    if (email && OTP) {
      let response;
      try {
        response = await user.register_verify({
          email: `${email}_register`,
          number,
          name,
          secret: OTP,
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
  } else {
    res.status(422).json({
      status: 422,
      message: "Enter correct data.",
    });
  }
});

router.get("/login-google", CheckLogged, async (req, res) => {
  let { google = null } = req.query;

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

    if (googleCheck?.data?.email) {
      response = await user.getUserByEmail(
        googleCheck.data.email?.toLowerCase?.()
      );
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
    if (response?._id) {
      let token = jwt.sign(
        {
          _id: response._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
          expires: new Date(Date.now() + 86400000),
        })
        .json({
          status: 200,
          message: "Success",
          data: response,
        });
    }
  }
});

router.post("/login-otp", CheckLogged, async (req, res) => {
  let { email } = req?.body;

  email = email?.toLowerCase?.();

  if (email) {
    let secret = FiveDigit?.();

    let response;
    try {
      response = await user.login_request({
        email: `${email}_login`,
        secret,
      });

      if (response) {
        await sendMail({
          to: email,
          subject: `Soft Chat Login Verification Code`,
          text: secret,
        })

        res.status(200).json({
          status: 200,
          message: "Login Otp Sented",
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
    }
  } else {
    res.status(422).json({
      status: 422,
      message: "Enter Email",
    });
  }
});

router.post("/login-verify", CheckLogged, async (req, res) => {
  let { email, OTP } = req?.body;

  email = email?.toLowerCase?.();

  if (email && OTP) {
    let response;
    try {
      response = await user.login_verify(`${email}_login`, OTP);
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
        let token = jwt.sign(
          {
            _id: response._id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "24h",
          }
        );

        res
          .status(200)
          .cookie("token", token, {
            httpOnly: true,
            expires: new Date(Date.now() + 86400000),
          })
          .json({
            status: 200,
            message: "Success",
            data: response,
          });
      }
    }
  } else {
    res.status(422).json({
      status: 422,
      message: "Enter Required Fields",
    });
  }
});

router.post(
  "/edit-profile-otp",
  (req, res, next) => {
    req.query.next = true;
    next();
  },
  CheckLogged,
  async (req, res) => {
    let secret = FiveDigit?.();

    let response;
    try {
      response = await user.edit_request(secret, req?.query?.userId, req?.body);

      if (response) {
        await sendMail(
          {
            to: req?.query?.email,
            subject: `Soft Chat Profile Edit Verification Code`,
            text: secret,
          })

        res.status(200).json({
          status: 200,
          message: "Profile Edit Otp Sented",
          data: {
            otp: true,
          },
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
    }
  }
);

router.put(
  "/edit-profile-verify",
  (req, res, next) => {
    req.query.next = true;
    next();
  },
  CheckLogged,
  async (req, res) => {
    try {
      let response = await user.edit_profile(req?.body, req?.query?.userId);

      if (response) {
        res.status(200).json({
          status: 200,
          message: "Success",
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
    }
  }
);

router.delete(
  "/remove-avatar",
  (req, res, next) => {
    req.query.next = true;
    next();
  },
  CheckLogged,
  async (req, res) => {
    try {
      let response = await user.remove_avatar(req?.query?.userId);

      if (response?.modifiedCount) {
        fs.unlink(`./files/profiles/${req?.query?.userId}.png`, (err) => {
          console.log(`Error When Delete Avatar : ${err}`);
        });

        res.status(200).json({
          status: 200,
          message: "Success",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        message: "Failed",
      });
    }
  }
);

router.put(
  "/change-avatar",
  (req, res, next) => {
    req.query.next = true;
    next();
  },
  CheckLogged,
  multer.profile.single("avatar"),
  async (req, res) => {
    try {
      let response = await user.change_avatar(
        req?.file?.filename,
        req?.query?.userId
      );

      if (response) {
        res.status(200).json({
          status: 200,
          message: "Success",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        message: err,
      });
    }
  }
);

router.get("/logout", (req, res) => {
  res.clearCookie("token").status(200).json({
    status: 200,
    message: "Logout",
  });
});

export default router;
