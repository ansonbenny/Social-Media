import React, {
  Fragment,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { ChatDetails, ChatLive, Users } from "../components";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoading, setNotification } from "../redux/additional";
import { useSocket } from "../hooks";
import { axios } from "../lib";

const reducer = (value, { type, ...actions }) => {
  switch (type) {
    case "size":
      return {
        ...value,
        size: {
          lg: window.matchMedia("(min-width:951px)")?.matches,
          sm: window.matchMedia("(max-width:680px)")?.matches,
        },
      };
    case "modal":
      return {
        ...value,
        modal: { ...value?.modal, ...actions },
      };
    case "details":
      return { ...value, details: { status: value?.details?.status, ...actions?.data } };
    case "status":
      return { ...value, details: { ...value?.details, status: actions?.data } }
    case "timeout":
      return { ...value, timeout: actions?.data }
    default:
      return value;
  }
};

const Chats = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const Socket = useSocket();

  const ref = useRef({
    live: null,
    list: null
  });

  const { id } = useParams();

  const { location, user } = useOutletContext();

  const [state, action] = useReducer(reducer, {
    size: {
      lg: window.matchMedia("(min-width:951px)")?.matches,
      sm: window.matchMedia("(max-width:680px)")?.matches,
    },
    modal: {
      details: false,
    },
    details: {},
  });

  const onChat = (e) => {
    e?.preventDefault?.();

    const input = e?.target?.querySelector?.("input")

    if (input?.value) {
      const date = new Date();

      const chat = {
        id: Date?.now()?.toString(16),
        msg: input?.value,
        date: `${date.getDate()}-${date.getMonth() + 1
          }-${date.getFullYear()} | ${date.getHours()}:${date.getMinutes()}`,
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
            input.value = ''

            ref?.current?.live?.insertMsg?.({
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

  const onInput = (e) => {
    if (e?.target?.value) {
      Socket.emit("user status", {
        from: user?._id,
        to: id,
        status: 'typing'
      })
    }

    clearTimeout(state?.timeout)

    action({
      type: "timeout", data: setTimeout(() => {
        Socket.emit("user status", {
          from: user?._id,
          to: id,
          status: 'online'
        })
      }, 1000)
    })
  }

  const emitUser = useCallback(() => {
    Socket?.emit("user", user?._id);
  }, [Socket, user]);

  useEffect(() => {
    document.title = "Soft Chat - Chats";

    let timer;

    let abortControl = new AbortController();

    if (user) {
      // socket io

      emitUser();

      // recieve messages
      Socket?.on("chat message", (msg) => {
        if (
          msg?.match == `${user?._id}${id}` ||
          msg?.match == `${id}${user?._id}`
        ) {
          ref?.current?.live?.insertMsg?.(msg);

          Socket?.emit?.("read msg", {
            chatId: id,
            userId: user?._id,
          })
        } else if (msg?.match == user?._id) {
          if (id == user?._id) {
            ref?.current?.live?.insertMsg?.({ ...msg, read: true });
          }
        } else {
          dispatch(
            setNotification({ name: msg?.user, url: `/chat/${msg?.from}` })
          );
        }
      });

      // getting message read status
      Socket?.on("read msg", (data) => {
        if (data?.match == `${user?._id}${id}` ||
          data?.match == `${id}${user?._id}`) {
          ref?.current?.live?.readMsgs?.(data);
        }
      })

      // getting users status [online / offline]
      Socket?.on("all user status", (data) => {
        ref?.current?.list?.users_status?.(data);

        if (id) {
          // for chat
          const value = data?.find((obj) => obj?.userId == id)

          if (value) {
            action({ type: "status", data: "online" })
          } else {
            action({ type: "status", data: "offline" })
          }
        }
      })

      // getting single user status [online / offline]
      Socket?.on("user status", (data) => {
        if (data?.from == id) {
          action({ type: 'status', data: data?.status })
        }
      })

      // reading message when chat open
      Socket?.emit?.("read msg", {
        chatId: id,
        userId: user?._id,
      })

      if (id) {
        // fetching user details and latest chat

        (async () => {
          try {
            let res = await axios.get(`/chat-single/userChat/${id}`, {
              signal: abortControl?.signal,
            });

            ref?.current?.live?.insertInitial?.(res?.["data"]?.data?.chat?.msgs);

            action({ type: "details", data: res?.["data"]?.data?.details });

            timer = setTimeout(() => {
              dispatch(setLoading(false));
            }, 1000);
          } catch (err) {
            if (err?.code !== "ERR_CANCELED") {
              alert(err?.response?.data?.message || "Something Went Wrong");
              navigate("/");
            }
          }
        })();
      } else {
        timer = setTimeout(() => {
          dispatch(setLoading(false));
        }, 1000);
      }
    } else {
      dispatch(setLoading(true));
    }

    // resize

    const onResize = () => {
      action({ type: "size" });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);

      Socket?.off("chat message");

      Socket?.off("read msg");

      Socket?.off("all user status");

      Socket?.off("user status");

      clearTimeout(timer);

      abortControl?.abort?.();
    };
  }, [id, location, emitUser]);

  return (
    <section className="chats">
      {!id || !state?.size?.sm ? <Users ref={(elm) => {
        if (ref?.current) {
          ref.current.list = elm
        }
      }} isUsers /> : null}

      {id ? (
        <Fragment>
          <ChatLive
            ref={(elm) => {
              if (ref?.current) {
                ref.current.live = elm
              }
            }}
            details={state?.details}
            onChat={onChat}
            onInput={onInput}
            setModal={!state?.size?.lg
              ? () => {
                action({ type: "modal", details: true });
              }
              : undefined}
          />

          {state?.modal?.details || state?.size?.lg ? (
            <ChatDetails
              details={state?.details}
              isModal={
                state?.modal?.details && !state?.size?.lg ? true : undefined
              }
              setModal={
                state?.modal?.details && !state?.size?.lg
                  ? () => {
                    action({ type: "modal", details: false });
                  }
                  : undefined
              }
            />
          ) : null}
        </Fragment>
      ) : (
        !state?.size?.sm && (
          <div className="mesg_empty">
            <h1>Select a chat to start messaging</h1>
          </div>
        )
      )}
    </section>
  );
};

export default Chats;
