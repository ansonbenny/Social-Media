import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { StoriesUser, Users } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../redux/additional";

const Stories = () => {
  const dispatch = useDispatch();

  const { id } = useParams();

  const user = useSelector((state) => state?.user)

  const [size, setSize] = useState({
    sm: window.matchMedia("(max-width:680px)")?.matches,
  });

  useEffect(() => {
    let timer;

    if (user) {
      timer = setTimeout(() => {
        dispatch(setLoading(false));
      }, 1000);
    } else {
      dispatch(setLoading(true));
    }

    const onResize = () => {
      setSize({
        sm: window.matchMedia("(max-width:680px)")?.matches,
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);

      clearTimeout(timer);
    };
  }, [id]);

  return (
    <section className="stories">
      {!id || !size?.sm ? (
        <Users stories selected={id ? true : undefined} />
      ) : null}

      {id ? (
        <StoriesUser />
      ) : (
        !size?.sm && (
          <div className="mesg_empty">
            <h1>Select a user to see stories</h1>
          </div>
        )
      )}
    </section>
  );
};

export default Stories;
