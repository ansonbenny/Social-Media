import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import path from "path";
import { Server } from "socket.io";

// routes
import userRoute from "./routes/user.js";
import socketRoute from "./routes/socket.js";

import { connectDB } from "./db/config.js";

dotenv.config(); // env config

const port = process.env.PORT || 5000;

const app = express();

const corsConfig = {
  origin: "*",
  credentials: true,
};

const wrapSocketIo = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

app.use(express.json({ limit: "50mb" }));

app.use(cors(corsConfig));

app.use(cookieParser());

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsConfig,
});

io.use(wrapSocketIo(cookieParser()));

app.use(express.static("dist"));

app.use("/files", express.static("files"));

app.use("/api/user", userRoute);

app.get("/api", (req, res) => {
  res.send("Api V1");
});

socketRoute(app, io); // express route with socket io

app.get("/*", (req, res) => {
  res.sendFile(path.join(path.resolve(`${path.dirname("")}/dist/index.html`)));
});

server.listen(port, () => {
  connectDB((done, err) => {
    if (done) console.log("DB Connected");
    else console.log(`DB Connect Failed : ${err}`);
  });

  console.log(`Server Started Port : ${port}`);
});
