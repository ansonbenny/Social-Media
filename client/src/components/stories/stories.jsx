import React, { forwardRef, useEffect, useImperativeHandle, useReducer, useRef, useState } from "react";
import { AvatarSvg, ClipSvg, PlaySvg, PlusSvg, SendSvg, TrashSvg, Xsvg } from "../../assets";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useTrack } from "../../hooks";
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
      <Modal ref={(elm) => {
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
                  controlsList="nodownload"
                  disablePictureInPicture
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
                        uploaded: true
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

const reducer = (value, { type, ...actions }) => {
  switch (type) {
    case 'open':
      return { ...value, active: true, form: actions?.form || undefined }

    case 'close':
      return { active: undefined }
    case "file":
      return { ...value, video: actions?.file }
    case "clear-file":
      delete value?.video

      return { ...value }

    case "progress":
      return { ...value, progrees: actions?.data }

    default:
      return value
  }
}

const Modal = forwardRef((params, ref) => {

  const refs = useTrack()

  const navigate = useNavigate()

  const [state, action] = useReducer(reducer, {})

  const CloseModal = () => {
    if (refs?.current?.abort_controller) {
      refs?.current?.abort_controller?.abort?.()
    }

    action({ type: "close" })

    if (refs?.current?.['audio_seekbar']?.classList?.contains('modal_audio_seekBar')) {
      refs?.current?.['audio_tag']?.pause?.()
    }
  }

  const onUploadProgress = (e) => {
    const { loaded, total } = e;

    let percent = Math.floor((loaded * 100) / total);

    if (percent < 100) {
      action({ type: "progress", data: percent })
    } else {
      action({ type: 'close' })
    }
  };

  const FormHanlde = async (e) => {
    e?.preventDefault?.()

    if (refs?.current?.abort_controller) {
      refs?.current?.abort_controller?.abort?.()
    }

    const abortController = new AbortController()

    if (refs?.current) {
      refs.current.abort_controller = abortController
    }

    try {
      const formdata = new FormData();

      if (state?.video) {
        formdata.append("file", state?.video)
      }

      axios.post('/stories/new_story', formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal: abortController?.signal,
        onUploadProgress
      })
    } catch (err) {
      if (err?.response?.data?.status == 405) {
        alert("Please Login")
        navigate('/')
      } else if (err?.code !== "ERR_CANCELED") {
        alert(err?.response?.data?.message || "Something Went Wrong");
      } else {
        alert("Cancelled Old Request")
      }
    }
  }

  useEffect(() => {
    const ModalControl = (e) => {
      if (
        !refs?.current?.inner_modal?.contains(e?.target) &&
        !e?.target?.classList?.contains("chats_modal_special") &&
        !e?.target?.classList?.contains('file_upload')
      ) {
        CloseModal?.()
      }

    }

    window.addEventListener('click', ModalControl)

    return () => {
      window.removeEventListener('click', ModalControl)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    Modal: (data) => {
      if (typeof data == 'object') {
        action({ type: "open" })
        action({ type: "file", file: data })
      } else {
        action({ type: "open", form: data })
      }
    }
  }), [])

  return (
    <section data-for="modal_outer" className={state?.active ? "active" : "none"} >
      <div className={`inner_modal ${state?.video && 'active-full'}`} ref={(elm) => {
        if (refs?.current) {
          refs.current.inner_modal = elm
        }
      }}>

        <div className='video'>
          <video
            controls={false}
            src={state?.video?.url}
            controlsList="nodownload"
            disablePictureInPicture
            autoPlay={state?.video?.uploaded}
            ref={(elm) => {
              if (refs?.current) {
                refs.current.audio_tag = elm
              }
            }} onClick={(e) => {
              if (e?.target?.paused) {
                e?.target?.play?.()
              } else {
                e?.target?.pause?.()
              }
            }} />

          <input
            type="range"
            step="any"
            onChange={(e) => {
              refs.current['audio_tag'].currentTime = e?.target?.value
            }}
            ref={(elm) => {
              if (refs?.current) {
                refs.current.audio_seekbar = elm
              }
            }}
            className="non_active modal_audio_seekBar"
          />
        </div>

        {state?.form && <form onSubmit={FormHanlde}>
          <div className="upload">
            <input className="file_input_box" onInput={(e) => {
              if (e?.target?.files?.[0]?.size > 26214400) {
                alert("File Size Allowed Maximum 25Mb")
                e.target.value = ''
                action({ type: "clear-file" })
              } else if (e?.target?.files?.[0]) {
                e.target.files[0].url = URL.createObjectURL(e?.target?.files?.[0])
                action({ type: "file", file: e?.target?.files?.[0] })
              }
            }} type="file" accept={'video/*'} required />

            <ClipSvg />
          </div>
          <button type="button" onClick={CloseModal}>
            <Xsvg class_name={"svg_path_fill"} />
          </button>
          {
            !state?.progrees && <button type="submit">
              <SendSvg
                class_name={"svg_path_stroke"}
              />
            </button>
          }
        </form>}

        <div
          className={`progress ${state?.progrees ? 'active' : 'hide'}`}
          style={{ background: `linear-gradient(to right, #6b8afd 0%, #6b8afd ${state?.progrees}%, #333 ${state?.progrees}%, #333 100%)` }}
        />
      </div>
    </section>
  )
})