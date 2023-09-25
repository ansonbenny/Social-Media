import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StoriesUser, Users } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../redux/additional";
import { useSocket } from "../hooks";
import { axios } from "../lib";

const Stories = () => {
  const dispatch = useDispatch();

  const Socket = useSocket();

  const ref = useRef();

  const navigate = useNavigate();

  const { id } = useParams();

  const user = useSelector((state) => state?.user)

  const [size, setSize] = useState({
    sm: window.matchMedia("(max-width:680px)")?.matches,
  });

  const emitUser = useCallback(() => {
    Socket?.emit("user", user?._id);
  }, [Socket]);

  useEffect(() => {
    document.title = "Soft Chat - Stories";

    let timer;

    let abortControl;

    const getStories = async () => {
      if (abortControl) {
        abortControl?.abort?.();
      }

      abortControl = new AbortController();

      if (id) {
        try {
          let res = await axios.get(`/stories/get_stories/${id}`, {
            signal: abortControl?.signal,
          });

          ref?.current?.setInitial?.(res?.['data']?.data)

          timer = setTimeout(() => {
            dispatch(setLoading(false));
          }, 1000);
        } catch (err) {
          if (err?.code !== "ERR_CANCELED") {
            alert(err?.response?.data?.message || "Something Went Wrong");
            navigate("/stories");
          }
        }
      }
    }

    if (user) {
      // Socket io

      emitUser?.();

      Socket?.on("story update", () => {
        getStories?.()
      })

      if (id) {
        // fetching user stories

        getStories?.()
      } else {
        timer = setTimeout(() => {
          dispatch(setLoading(false));
        }, 1000);
      }
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

      Socket?.off("story update")

      abortControl?.abort?.();

      clearTimeout(timer);
    };
  }, [id, emitUser]);

  return (
    <section className="stories">
      {!id || !size?.sm ? (
        <Users stories />
      ) : null}

      {id ? (
        <StoriesUser ref={ref} />
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
