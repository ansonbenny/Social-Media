import React, { useCallback, useEffect, useRef, useState } from "react";
import { AllChats, ChatDetails, ChatLive } from "../components";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../redux/additional";
import { useSocket } from "../hooks";

const Chats = () => {
  const dispatch = useDispatch();

  const Socket = useSocket();

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

      Socket?.emit(
        "chat message",
        {
          chatId: id,
          userId: user?._id,
          chat,
        },
        (err, res) => {
          if (res) {
            ref?.current?.myMSg?.({
              from: user?._id,
              ...chat,
            });
          } else {
            alert(
              typeof err?.message == "string"
                ? err?.message
                : "Something went wrong. Try again."
            );
          }
        }
      );
    }
  };

  const emitUser = useCallback(() => {
    Socket?.emit("user", user?._id);
  }, [Socket]);

  useEffect(() => {
    document.title = "Soft Chat - Chats";

    if (user) {
      emitUser();

      Socket?.on("chat message", (msg) => {
        console.log(msg);
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

      Socket?.off("chat message");
    };
  }, [id, location, user, emitUser]);

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
