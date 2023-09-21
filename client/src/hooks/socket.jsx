import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { addAttend, addCall, addEnded } from "../redux/call";

const useSocket = (isCall) => {
  const SocketRef = useRef(null);

  const dispatch = useDispatch();

  const { id } = useParams();

  const navigate = useNavigate();

  useEffect(() => {

    SocketRef.current = io();

    SocketRef?.current?.on("connect_error", (err) => {
      if (err?.data?.status == 405) {
        navigate("/");
      }
    });

    SocketRef?.current?.on("close_window", (new_id) => {
      if (SocketRef?.current.id !== new_id) {
        navigate('/close_tab')
      }
    });

    // for video / audio calls
    SocketRef?.current?.on("call user", (data) => {
      if (!isCall) {
        dispatch(addCall(data));

        if (data?.audio) {
          navigate("/audio-call")
        } else {
          navigate("/video-call")
        }
      }
    })

    SocketRef?.current?.on("call cancel", (data) => {
      dispatch(addEnded());
    })

    SocketRef?.current?.on("call attend", (data) => {
      dispatch(addAttend());
    })

    return () => {
      SocketRef?.current?.off("connect_error");

      SocketRef?.current?.off("close_window")

      // for video / audio calls
      SocketRef?.current?.off("call user")

      SocketRef?.current?.off("call cancel")

      SocketRef?.current?.off("call attend")

      SocketRef?.current?.disconnect?.();
    };
  }, [id]);

  return SocketRef.current;
};

export default useSocket;
