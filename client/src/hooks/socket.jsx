import { useEffect } from "react";
import { io } from "socket.io-client";

const useSocket = () => {
  const Socket = io();

  useEffect(() => {
    Socket.on("connect", () => {
      console.log("connected");
    });

    Socket.on("disconnect", () => {
      console.log("disconnect");
    });

    return () => {
      Socket.off("connect");

      Socket.off("disconnect");
    };
  }, []);

  return Socket;
};

export default useSocket;
