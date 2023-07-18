import React, { useEffect, useState } from "react";
import { AllChats, ChatDetails, ChatLive } from "../components";
import { useOutletContext, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoading } from "../redux/additional";

const Groups = () => {
  const dispatch = useDispatch();

  const { id } = useParams();

  const { location, user } = useOutletContext();

  const [state, setState] = useState({
    size: {
      lg: window.matchMedia("(min-width:901px)")?.matches,
      sm: window.matchMedia("(max-width:680px)")?.matches,
    },
    modal: {
      details: false,
    },
  });

  useEffect(() => {
    document.title = "Soft Chat - Groups";

    let timer;

    if (user) {
      timer = setTimeout(() => {
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

      clearTimeout(timer);
    };
  }, [id, user, location]);

  return (
    <section className="chats">
      {id ? (
        <>
          {!state?.size?.sm && <AllChats />}

          <ChatLive
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

export default Groups;
