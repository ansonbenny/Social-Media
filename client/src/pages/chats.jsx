import React, {
  Fragment,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { AllChats, ChatDetails, ChatLive } from "../components";
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
          lg: window.matchMedia("(min-width:901px)")?.matches,
          sm: window.matchMedia("(max-width:680px)")?.matches,
        },
      };
    case "modal":
      return {
        ...value,
        modal: { ...value?.modal, ...actions },
      };
    case "details":
      return { ...value, details: actions?.data };

    default:
      return value;
  }
};

const Chats = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const Socket = useSocket();

  const ref = useRef();

  const { id } = useParams();

  const { location, user } = useOutletContext();

  const [state, action] = useReducer(reducer, {
    size: {
      lg: window.matchMedia("(min-width:901px)")?.matches,
      sm: window.matchMedia("(max-width:680px)")?.matches,
    },
    modal: {
      details: false,
    },
    data: {},
  });

  const onChat = (e) => {
    e?.preventDefault?.();

    if (e?.target?.querySelector?.("input")?.value) {
      const date = new Date();

      const chat = {
        id: Date?.now()?.toString(16),
        msg: e?.target?.querySelector?.("input")?.value,
        date: `${date.getDate()}-${
          date.getMonth() + 1
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
            ref?.current?.insertMsg?.({
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

    let timer;

    let abortControl = new AbortController();

    if (user) {
      // socket io

      emitUser();

      Socket?.on("chat message", (msg) => {
        if (
          msg?.match == `${user?._id}${id}` ||
          msg?.match == `${id}${user?._id}`
        ) {
          ref?.current?.insertMsg?.(msg);
        } else if (msg?.match == user?._id) {
          if (id == user?._id) {
            ref?.current?.insertMsg?.(msg);
          }
        } else {
          dispatch(
            setNotification({ name: msg?.user, url: `/chat/${msg?.from}` })
          );
        }
      });

      if (id) {
        // fetching user details and latest chat

        (async () => {
          try {
            let res = await axios.get(`/chat/userChat/${id}`, {
              signal: abortControl?.signal,
            });

            ref?.current?.insertInitial?.(res?.["data"]?.data?.chats);

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

      clearTimeout(timer);

      abortControl?.abort?.();
    };
  }, [id, location, emitUser]);

  return (
    <section className="chats">
      {!id || !state?.size?.sm ? <AllChats /> : null}

      {id ? (
        <Fragment>
          <ChatLive
            {...{
              ref,
              details: state?.details,
              onChat,
              setModal: !state?.size?.lg
                ? () => {
                    action({ type: "modal", details: true });
                  }
                : undefined,
            }}
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
