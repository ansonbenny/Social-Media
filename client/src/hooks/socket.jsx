import { useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const useSocket = () => {
  const SocketRef = useRef(null);

  const user = useSelector((state) => state?.user);

  const { id } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    SocketRef.current = io();

    SocketRef?.current?.on("connect_error", (err) => {
      if (err?.data?.status == 405) {
        navigate("/");
      }
    });

    return () => {
      SocketRef?.current?.off("connect_error");

      SocketRef?.current?.off("disconnect");
    };
  }, [id]);

  return SocketRef.current;
};

export default useSocket;
