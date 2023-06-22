import React, { useEffect, useState } from "react";
import { AllChats, ChatDetails, ChatLive } from "../components";
import { useParams } from "react-router-dom";

const Groups = () => {
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

export default Groups;
