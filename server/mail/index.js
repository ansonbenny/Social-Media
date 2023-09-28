import nodemailer from "nodemailer";
import dotnev from "dotenv";

dotnev.config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_EMAIL,
    pass: process.env.MAIL_SECRET,
  },
});

export const sendMail = (details) => {

  return new Promise(async (resolve, reject) => {
    try {
      let done = await transporter.sendMail(
        {
          from: `Soft Chat <${process.env.MAIL_EMAIL}>`,
          ...details,
        })

      resolve(done)
    } catch (err) {
      reject({
        status: 500,
        message: "Email Send Failed"
      })
    }
  })
};
