import React, {
  Fragment,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { ChatDetails, ChatLive, Users } from "../components";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
    list: null,
    details: null
  });

  const { id } = useParams();

  const user = useSelector((state) => state?.user)

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

  const onChat = async (e, del_data) => {
    e?.preventDefault?.();

    if (!del_data) {
      const input = e?.target?.querySelector?.("input")

      if (input?.value) {
        const date = new Date();

        Socket?.emit(
          "chat message",
          {
            chatId: id,
            userId: user?._id,
            msg: input?.value,
            date: `${date.getDate()}-${date.getMonth() + 1
              }-${date.getFullYear()} | ${date.getHours()}:${date.getMinutes()}`,
          },
          (err, res) => {
            if (res) {
              input.value = ''

              ref?.current?.live?.insertMsg?.(res);

              ref?.current?.list?.pushToTop({
                id,
                status: state?.details?.status?.toLowerCase?.()
              })
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
    } else {
      if (window.confirm("Do you want to delete it permanently?")) {
        try {
          await axios.delete('/chat-single/delete_msg', {
            data: {
              chatId: state?.details?._id,
              msg_id: del_data?.id,
              file: del_data?.file,
              date: del_data?.date
            }
          })
        } catch (err) {
          if (err?.response?.data?.status == 405) {
            alert("Please Login")
            navigate('/')
          }
        }
      }
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
  }, [Socket]);

  useEffect(() => {
    document.title = "Soft Chat - Chats";

    let timer;

    let abortControl = new AbortController();

    if (user) {
      // socket io

      emitUser();

      // recieve messages
      Socket?.on("chat message", (msg) => {
        if (!msg?.group) {

          ref?.current?.list?.pushToTop?.({
            id: msg?.from,
            status: msg?.match == `${user?._id}${id}` || msg?.match == `${id}${user?._id}` ? state?.details?.status?.toLowerCase?.() : false
          })

          if (
            msg?.match == `${user?._id}${id}` ||
            msg?.match == `${id}${user?._id}`
          ) {
            ref?.current?.live?.insertMsg?.(msg);

            ref?.current?.list?.pushToTop?.({
              id: msg?.from,
              status: state?.details?.status?.toLowerCase?.()
            })

            if (msg?.file) {
              ref?.current?.details?.ReloadMedia?.()
            }

            ref?.current?.list?.pushToTop?.({
              id: msg?.from,
              status: state?.details?.status?.toLowerCase?.()
            })

            Socket?.emit?.("read msg", {
              chatId: id,
              userId: user?._id,
            })
          } else if (msg?.match == user?._id) {
            if (id == user?._id) {
              ref?.current?.live?.insertMsg?.({ ...msg, read: true });

              if (msg?.file) {
                ref?.current?.details?.ReloadMedia?.()
              }
            }
          } else {
            ref?.current?.list?.pushToTop?.({
              id: msg?.from,
              unReadMsgs: true
            })

            dispatch(
              setNotification({ name: msg?.user, url: `/chat/${msg?.from}` })
            );
          }
        }
      });

      // deleted messages / entire chat
      Socket?.on("chat delete", (msg) => {
        if (
          msg?.match == `${user?._id}${id}` ||
          msg?.match == `${id}${user?._id}`
        ) {
          if (msg?.empty) {
            navigate('/')
          } else {
            ref?.current?.live?.deleteMsg?.(msg);

            if (msg?.file) {
              ref?.current?.details?.ReloadMedia?.()
            }
          }
        } else if (msg?.match == user?._id && id == user?._id) {
          if (msg?.empty) {
            navigate('/')
          } else {
            ref?.current?.live?.deleteMsg?.(msg);

            if (msg?.file) {
              ref?.current?.details?.ReloadMedia?.()
            }
          }
        }
      });

      // getting message read status
      Socket?.on("read msg", (data) => {
        if (data?.match == `${user?._id}${id}` ||
          data?.match == `${id}${user?._id}`) {
          ref?.current?.live?.readMsgs?.(data);
          ref?.current?.list?.readMsgs?.(data);
        }
      })

      // getting users status [online / offline]
      Socket?.on("all user status", (data) => {
        ref?.current?.list?.users_status?.(data);

        if (id) {
          // for chat

          if (data?._id == id && data?.offline) {
            action({ type: "status", data: "offline" })
          } else if (data?._id == id) {
            action({ type: "status", data: "online" })
          }
        }
      })

      // getting single user status [online / typing]
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

            ref?.current?.live?.insertInitial?.(res?.["data"]?.data?.items);

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
  }, [id, emitUser]);

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
            details={{ ...state?.details, me: id == user?._id }}
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
              ref={(elm) => {
                if (ref?.current) {
                  ref.current.details = elm
                }
              }}
              details={{ ...state?.details, me: id == user?._id }}
              isUser
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
