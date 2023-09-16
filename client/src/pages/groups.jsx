import React, { Fragment, useCallback, useEffect, useReducer, useRef } from "react";
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

  const user = useSelector((state) => state?.user)

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

        Socket?.emit(
          "group message",
          {
            groupId: id,
            user,
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
          await axios.delete('/chat-group/delete_msg', {
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
  }, [Socket]);

  useEffect(() => {
    document.title = "Soft Chat - Groups";

    let timer;

    let abortControl = new AbortController();

    if (user) {
      emitUser?.()

      // create group admin & for new members
      Socket?.on("new group", (data) => {
        ref?.current?.list?.pushToTop?.(data, true)

        if (data?.id == id) {
          ref?.current?.details?.ReloadMembers?.()
        }
      });

      // edit group
      Socket?.on("edit group", (data) => {
        if (id == data?.id) {
          action({ type: "update_details", data: data?.details })
        }

        ref?.current?.list?.update_details(data)
      })

      //remove / exit member

      Socket?.on("remove member", (data) => {
        if (data?.id == id) {
          if (data?.userId == user?._id) {
            navigate("/groups")
          } else {
            ref?.current?.details?.ReloadMembers?.()
          }
        }
      })

      // recieve msgs
      Socket?.on("chat message", (msg) => {
        if (msg?.group) {
          // read msgs
          if (msg?.group == id) {
            ref?.current?.live?.insertMsg?.(msg)

            if (msg?.file) {
              ref?.current?.details?.ReloadMedia?.()
            }

            ref?.current?.list?.pushToTop?.(msg?.group_data, true)

            Socket?.emit?.("read group msg", {
              groupId: id,
              userId: user?._id,
            })
          } else {
            ref?.current?.list?.pushToTop?.({
              ...msg?.group_data,
              unReadMsgs: true
            }, true)
          }
        } else {
          dispatch(
            setNotification({ name: msg?.user, url: `/chat/${msg?.from}` })
          );
        }
      });

      // deleted messages / entire chat
      Socket?.on("group chat delete", (msg) => {
        if (
          msg?.group == id
        ) {
          if (msg?.empty) {
            navigate('/groups')
          } else {
            ref?.current?.live?.deleteMsg?.(msg);

            if (msg?.file) {
              ref?.current?.details?.ReloadMedia?.()
            }
          }
        }
      });

      // getting message read status
      Socket?.on("read group msg", (data) => {
        if (data?.from == id) {
          ref?.current?.live?.readMsgs?.(data);
          ref?.current?.list?.readMsgs?.(data);
        }
      })

      // reading message when chat open
      Socket?.emit?.("read group msg", {
        groupId: id,
        userId: user?._id,
      })

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

      Socket?.off("read group msg")

      Socket?.off("group chat delete",)

      Socket?.off("remove member")

      clearTimeout(timer);
    };
  }, [id, emitUser]);

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
              ref={(elm) => {
                if (ref.current) {
                  ref.current.details = elm
                }
              }}
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
