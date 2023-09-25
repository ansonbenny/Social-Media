import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { AvatarSvg, PlaySvg, PlusSvg, TrashSvg } from "../../assets";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "../";
import { axios } from "../../lib";
import "./style.scss";

const StoriesUser = forwardRef((params, ref) => {

  const { id } = useParams();

  const refs = useRef({});

  const navigate = useNavigate();

  const user = useSelector((state) => state?.user);

  const [state, setState] = useState({})

  const getStories = async (offset = 0) => {
    if (refs?.current?.abortControl) {
      refs?.current?.abortControl?.abort?.()
    }

    refs.current.abortControl = new AbortController();

    try {
      let res = await axios.get(`/stories/get_stories/${id}`, {
        params: {
          offset
        },
        signal: refs?.current?.abortControl?.signal,
      });

      if (offset >= 1 && res?.['data']?.data?.stories?.length >= 1) {
        setState((state) => ({
          total: res?.['data']?.data?.total,
          stories: [...state?.stories, ...res?.['data']?.data?.stories]
        }))
      } else if (res?.['data']?.data) {
        setState(res?.['data']?.data)
      }

    } catch (err) {
      if (err?.response?.data?.status == 405) {
        alert("Please Login")
        navigate('/')
      } else if (err?.code !== "ERR_CANCELED") {
        alert(err?.response?.data?.message || "Something Went Wrong");
      }
    }
  }

  const TrashStory = async (data) => {
    if (window.confirm("Do you want delete?")) {
      if (refs?.current?.abortControl) {
        refs?.current?.abortControl?.abort?.()
      }

      refs.current.abortControl = new AbortController();

      try {
        let res = await axios.delete(`/stories/delete_story/`, {
          data,
          signal: refs?.current?.abortControl?.signal,
        });

        if (res?.['data']) {
          getStories()
        }

      } catch (err) {
        if (err?.response?.data?.status == 405) {
          alert("Please Login")
          navigate('/')
        } else if (err?.code !== "ERR_CANCELED") {
          alert(err?.response?.data?.message || "Something Went Wrong");
        }
      }
    }
  }

  useImperativeHandle(ref, () => ({
    setInitial: (data) => {
      setState(data)
    }
  }), [])

  return (
    <section className="stories-user">
      <Modal isStories ref={(elm) => {
        if (refs?.current) {
          refs.current.modal = elm
        }
      }} />

      <div className="items">
        {
          id == user?._id && <div className="card-add">
            <button
              className="chats_modal_special"
              onClick={() => {
                refs?.current?.modal?.Modal?.(true)
              }}>
              <PlusSvg />
            </button>
            <p>
              Create
              <br />
              Your Story
            </p>
          </div>
        }

        {
          state?.stories?.map((obj, key) => {
            return (
              <div className="card" key={key}>
                <video
                  className="thumb"
                  autoPlay={false}
                  muted={true}
                  controls={false}
                  src={obj?.url}
                />

                <div className="user">

                  {
                    obj?.user?.img ?
                      <img src={`/files/profiles/${obj?.user?.img}`} />
                      : <AvatarSvg />
                  }

                  <h1 className="user-name">{obj?.user?.name}</h1>
                </div>

                <div className="actions">
                  <button
                    className="chats_modal_special"
                    onClick={() => {
                      refs?.current?.modal?.Modal?.({
                        ...obj,
                        type: "video"
                      })
                    }}>
                    <PlaySvg width={"25px"} height={"25px"} />
                  </button>

                  {
                    id == user?._id && <button onClick={() => TrashStory({
                      url: obj?.url,
                      _id: obj?._id
                    })} className="trash">
                      <TrashSvg width={'16px'} height={'16px'} />
                    </button>
                  }
                </div>

              </div>
            )
          })
        }
      </div>

      {
        state?.total > state?.stories?.length && <button onClick={() => {
          getStories(state?.stories?.length)
        }} data-for="load_more">Load More</button>
      }
    </section>
  );
});

export default StoriesUser;
