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

export const sendMail = (details, callback) => {
  transporter.sendMail(
    {
      from: `Soft Chat <${process.env.MAIL_EMAIL}>`,
      ...details,
    },
    (err, done) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, done);
      }
    }
  );
};
