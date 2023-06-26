import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// routes
import userRoute from "./routes/user.js";
import { connectDB } from "./db/config.js";

dotenv.config(); // env config

let port = process.env.PORT || 5000;

let app = express();

app.use(express.json({ limit: "50mb" }));

app.use(cors({ credentials: true, origin: "*" }));

app.use(cookieParser());

app.use("/api/user", userRoute);

app.get("/api", (req, res) => {
  res.send("Api V1");
});

app.listen(port, () => {
  connectDB((done, err) => {
    if (done) console.log("DB Connected");
    else console.log(`DB Connect Failed : ${err}`);
  });

  console.log(`Server Started Port : ${port}`);
});
