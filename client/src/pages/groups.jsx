import React, { Fragment, useCallback, useEffect, useReducer, useRef } from "react";
import { ChatDetails, ChatLive, Users } from "../components";
import { useOutletContext, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoading } from "../redux/additional";
import { useSocket } from "../hooks";

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

    default:
      return value;
  }
};

const Groups = () => {
  const dispatch = useDispatch();

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

    if (user) {
      emitUser?.()

      Socket?.on("new group", (data) => {
        console.log(data)
      });

      if (id) {
        //api call

        timer = setTimeout(() => {
          dispatch(setLoading(false));
        }, 1000);
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
      {!id || !state?.size?.sm ? <Users /> : null}

      {id ? (
        <Fragment>
          <ChatLive
            setModal={!state?.size?.lg
              ? () => {
                action({ type: "modal", details: true });
              }
              : undefined}
          />

          {state?.modal?.details || state?.size?.lg ? (
            <ChatDetails
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
