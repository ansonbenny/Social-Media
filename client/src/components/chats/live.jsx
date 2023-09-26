import React, {
  forwardRef,
  useEffect,
  useImperativeHandle
} from "react";
import {
  AvatarSvg,
  ClipSvg,
  CopySvg,
  PauseSvg,
  PhoneSvg,
  PlaySvg,
  SendSvg,
  TickSvg,
  TrashSvg,
  VideoSvg,
} from "../../assets";
import { useSelector } from "react-redux";
import { LoadingCircle, Modal } from "../";
import useScroll from "../../hooks/scroll";
import { useTrack } from "../../hooks";
import { useNavigate } from "react-router-dom";
import "./style.scss";

const ChatLive = forwardRef(({ setModal, onChat, details, onInput }, ref) => {
  const audio = useTrack();

  const navigate = useNavigate()

  const [refs, state, action] = useScroll({
    url: `${details?.user ? `/chat-single/userChat/${details?._id}` : `/chat-group/get_group/${details?._id}`}`,
    details
  })

  const user = useSelector((state) => state?.user);

  const IsValidUrl = (urlString) => {
    try {
      const res = new URL(urlString)
      if (res) return true
    } catch (err) {
      return false
    }
  }

  useImperativeHandle(ref, () => ({
    insertMsg: (data) => {
      action({ type: "new", data });
    },
    insertInitial: (data) => {
      action({ type: "initial_msg", data });
    },
    readMsgs: (data) => {
      action({ type: "read", data })
    },
    deleteMsg: (data) => {
      action({ type: "delete", data })
    }
  }), []);

  useEffect(() => {
    if (state?.new) {
      refs?.current?.main?.scroll?.(0, refs?.current?.main?.scrollHeight);
    } else {
      refs?.current?.main?.scroll?.(0, 30);
    }
  }, [state?.items]);

  return (
    <section className="live">
      <div className="head">
        <div
          className="cover"
          onClick={() => {
            setModal?.();
          }}
        >
          {details?.img ? (
            <img src={details?.img?.url ? details?.img?.url : `/files/profiles/${details?.img}`} alt="profile" />
          ) : (
            <AvatarSvg />
          )}
        </div>
        <div
          className="details"
          onClick={() => {
            setModal?.((state) => ({
              ...state,
              details: true,
            }));
          }}
        >
          <h1>{details?.name}</h1>
          <p>{details?.status || "offline"}</p>
        </div>

        {
          details?.user && !details?.me ? (<div className="actions">
            <button onClick={async () => {
              let Call = await import('./functions/call').catch(() => console.error("fun import error"))

              Call.default(details, true).then((login) => { if (login) { navigate('/login') } })
            }}>
              <PhoneSvg width={"18px"} height={"18px"} />
            </button>
            <button onClick={async () => {
              let Call = await import('./functions/call').catch(() => console.error("fun import error"))

              Call.default(details).then((login) => { if (login) { navigate('/login') } })
            }}>
              <VideoSvg width={"25px"} height={"25px"} />
            </button>
          </div>)
            : null
        }
      </div>

      <div className="body">

        <Modal ref={(elm) => {
          if (refs?.current) {
            refs.current.modal_msgs = elm
          }
        }}

          audio_live={audio?.current?.audio_tag}

          isUser={details?.user}
        />

        <div
          className="messages"
          ref={(elm) => {
            if (refs?.current) {
              refs.current.main = elm;
            }
          }}
        >
          <LoadingCircle ref={refs} />

          {state?.items?.map((obj, key) => {
            if (obj?.from == user?._id) {
              return (
                <div className="me" key={key}>
                  <div className="card">
                    <div className="inner">
                      <div className="from">
                        <p className="author">You</p>
                        <p className="time">{obj?.date}</p>
                        <div className="status_msg">
                          <TickSvg />
                          {
                            obj?.read && <TickSvg />
                          }
                        </div>
                      </div>

                      <div className="msg">
                        {
                          IsValidUrl(obj?.msg) ? <a href={obj?.msg} target="_blank">
                            {obj?.msg}
                          </a>
                            : obj?.msg
                        }
                        {
                          /image/i.test(obj?.file?.type) &&
                          <img
                            loading="lazy" src={obj?.file?.url}
                            className="chats_modal_special"
                            onClick={() => {
                              refs?.current?.modal_msgs?.Modal?.(obj?.file)
                            }}
                          />
                        }
                        {
                          /video/i.test(obj?.file?.type) &&
                          <div className="video chats_modal_special" onClick={() => {
                            refs?.current?.modal_msgs?.Modal?.(obj?.file)
                          }}>
                            <PlaySvg />
                          </div>
                        }
                        {
                          /audio/i.test(obj?.file?.type) &&
                          <div className="audio_outer">
                            <div className="audio">
                              <button
                                className={`${obj?.id}_audio_btn audio_btn`}
                                onClick={(e) => {
                                  audio?.current?.audio_tag?.pause?.()

                                  if (!e?.target?.classList?.contains?.("play")) {
                                    audio.current.audio_btn = e?.target

                                    audio.current.audio_seekbar = e?.target?.parentElement?.querySelector('input')

                                    audio.current.audio_tag.src = e?.target?.getAttribute('src')

                                    audio?.current?.audio_tag?.play?.()
                                  }

                                  refs?.current?.audio_btns?.forEach((elm) => {
                                    elm?.classList?.remove("play")
                                  })
                                }}
                                type="button"
                                src={obj?.file?.url}
                                ref={(elm) => {
                                  if (refs?.current && refs?.current?.audio_btns) {
                                    refs.current.audio_btns.push(elm)
                                  } else if (refs?.current) {
                                    refs.current.audio_btns = [elm]
                                  }
                                }}
                              >
                                <PlaySvg />
                                <PauseSvg />
                              </button>
                              <input
                                type="range"
                                step="any"
                                onChange={(e) => {
                                  if (audio?.current?.audio_seekbar &&
                                    audio?.current?.audio_seekbar?.classList?.contains(`${obj?.id}_seekBar`)) {

                                    if (audio?.current?.['audio_tag']) {
                                      audio.current['audio_tag'].currentTime = e?.target?.value
                                    }
                                  } else {
                                    const button = e?.target?.parentElement?.querySelector('button')

                                    refs?.current?.audio_btns?.forEach((elm) => {
                                      elm?.classList?.remove('play')
                                    })

                                    audio.current.audio_btn = button

                                    audio.current.audio_seekbar = e?.target

                                    audio.current.audio_tag.src = button?.getAttribute('src')

                                    audio?.current?.audio_tag?.play?.()
                                  }
                                }}
                                className={`non_active ${obj?.id}_seekBar`}
                              />
                            </div>
                          </div>
                        }
                      </div>
                    </div>

                    <div className="actions-msg">
                      <button onClick={() =>
                        onChat(undefined, {
                          id: obj?.id,
                          file: obj?.file,
                          date: obj?.date
                        })
                      }>
                        <TrashSvg />
                      </button>
                      {
                        !obj?.file && <button
                          onClick={() => {
                            window?.navigator?.clipboard?.writeText?.(obj?.msg);
                            window?.alert?.("Text Copied");
                          }}
                        >
                          <CopySvg class_name={"path_fill"} />
                        </button>
                      }
                    </div>
                  </div>

                  <div className="cover">
                    {user?.img ? (
                      <img src={`/files/profiles/${user?.img}`} alt="profile" />
                    ) : (
                      <AvatarSvg />
                    )}
                  </div>
                </div>
              );
            } else {
              return (
                <div className="others" key={key}>
                  <div className="cover">
                    {obj?.profile ? (
                      <img
                        src={`/files/profiles/${obj?.profile}`}
                        alt="profile"
                      />
                    ) : (
                      details?.user && details?.img ? (
                        <img
                          src={`/files/profiles/${details?.img}`}
                          alt="profile"
                        />
                      ) : (
                        <AvatarSvg />
                      )
                    )}
                  </div>
                  <div className={`card ${!obj?.file ? 'actionable' : 'no_action'}`}>
                    <div className="inner">
                      <div className="from">
                        <p className="author">{obj?.user_name || details?.name}</p>
                        <p className="time">{obj?.date}</p>
                      </div>

                      <div className="msg">
                        {
                          IsValidUrl(obj?.msg) ? <a href={obj?.msg} target="_blank">
                            {obj?.msg}
                          </a>
                            : obj?.msg
                        }
                        {
                          /image/i.test(obj?.file?.type) &&
                          <img
                            loading="lazy" src={obj?.file?.url}
                            className="chats_modal_special"
                            onClick={() => {
                              refs?.current?.modal_msgs?.Modal?.(obj?.file)
                            }}
                          />
                        }
                        {
                          /video/i.test(obj?.file?.type) &&
                          <div className="video chats_modal_special" onClick={() => {
                            refs?.current?.modal_msgs?.Modal?.(obj?.file)
                          }}>
                            <PlaySvg />
                          </div>
                        }
                        {
                          /audio/i.test(obj?.file?.type) &&
                          <div className="audio">
                            <button
                              className={`${obj?.id}_audio_btn audio_btn`}
                              onClick={(e) => {
                                audio?.current?.audio_tag?.pause?.()

                                if (!e?.target?.classList?.contains?.("play")) {
                                  audio.current.audio_btn = e?.target

                                  audio.current.audio_seekbar = e?.target?.parentElement?.querySelector('input')

                                  audio.current.audio_tag.src = e?.target?.getAttribute('src')

                                  audio?.current?.audio_tag?.play?.()
                                }

                                refs?.current?.audio_btns?.forEach((elm) => {
                                  elm?.classList?.remove("play")
                                })
                              }}
                              type="button"
                              src={obj?.file?.url}
                              ref={(elm) => {
                                if (refs?.current && refs?.current?.audio_btns) {
                                  refs.current.audio_btns.push(elm)
                                } else if (refs?.current) {
                                  refs.current.audio_btns = [elm]
                                }
                              }}
                            >
                              <PlaySvg />
                              <PauseSvg />
                            </button>
                            <input
                              type="range"
                              step="any"
                              onChange={(e) => {
                                if (audio?.current?.audio_seekbar &&
                                  audio?.current?.audio_seekbar?.classList?.contains(`${obj?.id}_seekBar`)) {

                                  if (audio?.current?.['audio_tag']) {
                                    audio.current['audio_tag'].currentTime = e?.target?.value
                                  }
                                } else {
                                  const button = e?.target?.parentElement?.querySelector('button')

                                  refs?.current?.audio_btns?.forEach((elm) => {
                                    elm?.classList?.remove('play')
                                  })

                                  audio.current.audio_btn = button

                                  audio.current.audio_seekbar = e?.target

                                  audio.current.audio_tag.src = button?.getAttribute('src')

                                  audio?.current?.audio_tag?.play?.()
                                }
                              }}
                              className={`non_active ${obj?.id}_seekBar`}
                            />
                          </div>
                        }
                      </div>
                    </div>

                    {
                      !obj?.file && <div className="actions-msg">
                        <button
                          onClick={() => {
                            window?.navigator?.clipboard?.writeText?.(obj?.msg);
                            window?.alert?.("Text Copied");
                          }}
                        >
                          <CopySvg class_name={"path_fill"} />
                        </button>
                      </div>
                    }
                  </div>
                </div>
              );
            }
          })}

        </div>

        <div className="textarea">
          <form className="border" onSubmit={onChat}>
            <button type="button" className="file_upload" onClick={() => {
              refs?.current?.['modal_msgs']?.Modal?.(true)
            }}>
              <ClipSvg class_name={"svg_fill"} />
            </button>
            <input onInput={onInput} placeholder="Type Something..." />
            <button type="submit">
              <SendSvg
                class_name={"svg_path_stroke"}
              />
            </button>
          </form>
        </div>
      </div>

      <audio id="audio_tag" controls ref={(elm) => {
        if (audio?.current) {
          audio.current.audio_tag = elm
        }
      }} />
    </section>
  );
});

export default ChatLive;
