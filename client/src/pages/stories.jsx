import React, { useEffect, useState } from "react";
import UsersStories from "../components/stories/users";
import { useParams } from "react-router-dom";
import { StoriesUser } from "../components";

const Stories = () => {
  const { id } = useParams();

  const [size, setSize] = useState({
    lg: !window.matchMedia("(max-width:900px)")?.matches,
    sm: window.matchMedia("(max-width:680px)")?.matches,
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
    <section className="stories">
      {id ? (
        <>
          {!size?.sm && <UsersStories />}
          <StoriesUser />
        </>
      ) : (
        <>
          <UsersStories notSelected />

          {!size?.sm && (
            <div className="mesg_empty">
              <h1>Select a user to see stories</h1>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Stories;
