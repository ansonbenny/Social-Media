import React, { useEffect } from "react";
import { AllChats, ChatDetails, ChatLive } from "../components";
import { useParams } from "react-router-dom";

const Chats = () => {
  const { id } = useParams();
  useEffect(() => {}, [id]);
  return (
    <section className="chats">
      <AllChats />
      {id ? (
        <>
          <ChatLive />
          <ChatDetails />
        </>
      ) : (
        <div className="mesg_empty">
          <h1>Select a chat to start messaging</h1>
        </div>
      )}
    </section>
  );
};

export default Chats;
