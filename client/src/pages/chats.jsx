import React, { useEffect, useState } from "react";
import { AllChats, ChatDetails, ChatLive } from "../components";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../redux/additional";

const Chats = () => {
  const dispatch = useDispatch();

  const location = useLocation();

  const { id } = useParams();

  const { user } = useSelector((state) => state);

  const [size, setSize] = useState({
    lg: !window.matchMedia("(max-width:900px)")?.matches,
    sm: window.matchMedia("(max-width:680px)")?.matches,
  });

  const [modal, setModal] = useState({
    details: false,
  });

  useEffect(() => {
    document.title = "Soft Chat - Chats";
   // console.log(location)

    if (user) {
      setTimeout(() => {
        dispatch(setLoading(false));
      }, 1000);
    } else {
      dispatch(setLoading(true));
    }

    const onResize = () => {
      setSize({
        lg: !window.matchMedia("(max-width:900px)")?.matches,
        sm: window.matchMedia("(max-width:680px)")?.matches,
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [id, location, user]);

  return (
    <section className="chats">
      {id ? (
        <>
          {!size?.sm && <AllChats />}

          <ChatLive setModal={!size?.lg ? setModal : null} />

          {size?.lg ? (
            <ChatDetails />
          ) : (
            modal?.details && <ChatDetails isModal setModal={setModal} />
          )}
        </>
      ) : (
        <>
          <AllChats />

          {!size?.sm && (
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
