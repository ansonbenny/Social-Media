import React, { useEffect, useRef, useState } from "react";
import { AllChats, ChatDetails, ChatLive } from "../components";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../redux/additional";
import { useSocket } from "../hooks";

const Chats = () => {
  const dispatch = useDispatch();

  const Socket = useSocket();

  const navigate = useNavigate();

  const location = useLocation();

  const ref = useRef();

  const { id } = useParams();

  const user = useSelector((state) => state?.user);

  const [state, setState] = useState({
    size: {
      lg: window.matchMedia("(min-width:901px)")?.matches,
      sm: window.matchMedia("(max-width:680px)")?.matches,
    },
    modal: {
      details: false,
    },
  });

  const onChat = (e) => {
    e?.preventDefault?.();

    if (e?.target?.querySelector?.("input")?.value) {
      const chat = {
        id: Date?.now()?.toString(16),
        msg: e?.target?.querySelector?.("input")?.value,
      };

      Socket.emit("chat message", {
        chatId: id,
        chat,
      });

      Socket.on("response", (data) => {
        console.log(data);
        if (data?.status === 405) {
          navigate("/");
        } else if (data?.error) {
          alert("Something went wrong. Try again.");
        } else {
          ref?.current?.myMSg?.({
            from: user?._id,
            ...chat,
          });
        }
      });
    }
  };

  useEffect(() => {
    document.title = "Soft Chat - Chats";

    if (user) {
      Socket.emit("user", user?._id);

      Socket.on("chat message", (msg) => {
        ref?.current?.othersMsg?.(msg);
      });

      setTimeout(() => {
        dispatch(setLoading(false));
      }, 1000);
    } else {
      dispatch(setLoading(true));
    }

    const onResize = () => {
      setState((state) => ({
        ...state,
        size: {
          lg: window.matchMedia("(min-width:901px)")?.matches,
          sm: window.matchMedia("(max-width:680px)")?.matches,
        },
      }));
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);

      Socket.off("chat message");
    };
  }, [id, location, user]);

  return (
    <section className="chats">
      {id ? (
        <>
          {!state?.size?.sm && <AllChats />}

          <ChatLive
            ref={ref}
            onChat={onChat}
            setModal={
              !state?.size?.lg
                ? () => {
                    setState((state) => ({
                      ...state,
                      modal: { ...state?.modal, details: true },
                    }));
                  }
                : null
            }
          />

          {state?.size?.lg ? (
            <ChatDetails />
          ) : (
            state?.modal?.details && (
              <ChatDetails
                isModal
                setModal={() => {
                  setState((state) => ({
                    ...state,
                    modal: { ...state, details: false },
                  }));
                }}
              />
            )
          )}
        </>
      ) : (
        <>
          <AllChats />

          {!state?.size?.sm && (
            <div className="mesg_empty">
              <h1>Select a chat to start messaging</h1>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Chats;
