import React, { useEffect, useState } from "react";
import { AllChats, ChatDetails, ChatLive } from "../components";
import { useParams } from "react-router-dom";

const Chats = () => {
  const { id } = useParams();

  const [size, setSize] = useState({
    lg: !window.matchMedia("(max-width:900px)")?.matches,
    sm: window.matchMedia("(max-width:680px)")?.matches,
  });

  const [modal, setModal] = useState({
    details: false,
  });

  useEffect(() => {
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
  }, [id]);

  return (
    <section className="chats">
      {!id && <AllChats />}
      {id ? (
        <>
          {!size?.sm && <AllChats />}

          <ChatLive setModal={!size?.lg ? setModal : null} />

          {size?.lg && <ChatDetails />}

          {!size?.lg && modal?.details ? (
            <ChatDetails isModal setModal={setModal} />
          ) : null}
        </>
      ) : (
        !size?.sm && (
          <div className="mesg_empty">
            <h1>Select a chat to start messaging</h1>
          </div>
        )
      )}
    </section>
  );
};

export default Chats;
