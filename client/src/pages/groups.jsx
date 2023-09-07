import React, { Fragment, useCallback, useEffect, useReducer, useRef } from "react";
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
      return { ...value, details: { ...actions?.data } };

    case "update_details":
      return { ...value, details: { ...value?.details, ...actions?.data } }

    default:
      return value;
  }
};

const Groups = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const Socket = useSocket();

  const ref = useRef({
    live: null,
    list: null,
    details: null
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
  });

  const onChat = async (e, del_data) => {
    e?.preventDefault?.();

    if (!del_data) {
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
          "group message",
          {
            groupId: id,
            userId: user?._id,
            user_name: user?.name,
            profile: user?.img,
            chat,
          },
          (err, res) => {
            if (res) {
              input.value = ''

              ref?.current?.live?.insertMsg?.({
                from: user?._id,
                ...chat,
              });

              ref?.current?.list?.pushToTop({
                id,
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
              groupId: state?.details?._id,
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

  const emitUser = useCallback(() => {
    Socket?.emit("user", user?._id);
  }, [Socket, user]);

  useEffect(() => {
    document.title = "Soft Chat - Groups";

    let timer;

    let abortControl = new AbortController();

    if (user) {
      emitUser?.()

      Socket?.on("new group", (data) => {
        ref?.current?.list?.pushToTop?.(data, true)
      });

      Socket?.on("edit group", (data) => {
        if (id == data?.id) {
          action({ type: "update_details", data: data?.details })
        }

        ref?.current?.list?.update_details(data)
      })

      Socket?.on("chat message", (msg) => {
        if (msg?.group) {
          // read msgs
          console.log(msg)
          if (msg?.group == id) {
            ref?.current?.live?.insertMsg?.(msg)
          }
        } else {
          dispatch(
            setNotification({ name: msg?.user, url: `/chat/${msg?.from}` })
          );
        }
      });


      if (id) {
        // fetching group details and latest chat

        (async () => {
          try {
            let res = await axios.get(`/chat-group/get_group/${id}`, {
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
              navigate("/groups");
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

    const onResize = () => {
      action({ type: "size" });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);

      Socket?.off("chat message");

      Socket?.off("new group");

      Socket?.off("edit group");

      clearTimeout(timer);
    };
  }, [id, location, emitUser]);

  return (
    <section className="chats">
      {!id || !state?.size?.sm ? <Users ref={(elm) => {
        if (ref?.current) {
          ref.current.list = elm
        }
      }} /> : null}

      {id ? (
        <Fragment>
          <ChatLive
            ref={(elm) => {
              if (ref?.current) {
                ref.current.live = elm
              }
            }}
            onChat={onChat}
            details={state?.details}
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

export default Groups;
