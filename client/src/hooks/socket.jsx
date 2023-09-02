import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const useSocket = () => {
  const SocketRef = useRef(null);

  const { id } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    SocketRef.current = io();

    SocketRef?.current?.on("connect_error", (err) => {
      if (err?.data?.status == 405) {
        navigate("/");
      }
    });

    SocketRef?.current?.on("close_window", () => {
      console.log('close_wind')
     // window.close()
    });

    return () => {
      SocketRef?.current?.off("connect_error");

      SocketRef?.current?.off("close_window")

      SocketRef?.current?.disconnect?.();
    };
  }, [id]);

  return SocketRef.current;
};

export default useSocket;
