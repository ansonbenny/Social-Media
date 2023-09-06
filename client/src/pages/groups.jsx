import React, { Fragment, useCallback, useEffect, useReducer, useRef } from "react";
import { ChatDetails, ChatLive, Users } from "../components";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoading } from "../redux/additional";
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
