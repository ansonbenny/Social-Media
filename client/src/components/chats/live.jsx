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
  PlusSvg,
  SendSvg,
  TickSvg,
  TrashSvg,
  VideoSvg,
  Xsvg,
} from "../../assets";
import { useSelector } from "react-redux";
import { LoadingCircle } from "../";
import useScroll from "../../hooks/scroll";
import "./style.scss";

const ChatLive = forwardRef(({ setModal, onChat, details, onInput }, ref) => {

  const [refs, state, action] = useScroll({
    url: `/chat-single/userChat/${details?._id}`,
    details
  })

  const user = useSelector((state) => state?.user);

  useImperativeHandle(ref, () => ({
    insertMsg: (data) => {
      action({ type: "new", data });
    },
    insertInitial: (data) => {
      action({ type: "initial", data });
    },
    readMsgs: (data) => {
      action({ type: "read", data })
    }
  }));

  const AudioTimeChange = (time) => {
    if (refs?.current?.['audio_tag']) {
      refs.current['audio_tag'].currentTime = time
    }
  }

  useEffect(() => {
    if (state?.new) {
      refs?.current?.main?.scroll?.(0, refs?.current?.main?.scrollHeight);
    } else {
      refs?.current?.main?.scroll?.(0, 30);
    }

    const ModalControl = (e) => {
      const inner = refs?.current?.modal_msgs?.querySelector('.inner_modal')

      if (
        !inner?.contains(e?.target) &&
        !e?.target?.classList?.contains("img_for_modal") &&
        !e?.target?.classList?.contains('file_upload')
      ) {
        refs?.current?.modal_msgs?.classList?.remove?.("active")

        if (refs?.current?.['audio_seekbar']?.classList?.contains('modal_audio_seekBar')) {
          refs?.current?.['audio_tag']?.pause?.()
        }
      }

    }

    // handeling current time when playing audio files
    const HandleTimeAudio = (e) => {
      if (refs?.current?.["audio_seekbar"]) {
        refs.current["audio_seekbar"].value =
          refs?.current?.["audio_tag"]?.currentTime || 0;

        refs.current['audio_seekbar'].classList?.remove("non_active")

        var value =
          ((refs.current['audio_seekbar'].value - refs.current['audio_seekbar'].min) /
            (refs.current['audio_seekbar'].max - refs.current['audio_seekbar'].min)) *
          100;

        refs.current["audio_seekbar"].style.background = `linear-gradient(to right, #6b8afd 0%, #6b8afd ${value}%, #9ca3af ${value}%, #9ca3af 100%)`
      }
    }

    // handeling duration when playing audio files
    const HandleDurationAudio = (e) => {
      if (refs?.current?.["audio_seekbar"]) {
        refs.current["audio_seekbar"].value = 0;

        refs.current["audio_seekbar"].min = 0;

        refs.current["audio_seekbar"].max = refs?.current?.["audio_tag"]?.duration;
      }
    }

    // handeling audio play
    const HandleAudioPlay = () => {
      refs?.current?.["audio_btn"]?.classList?.add?.('play')
    }

    // handeling audio pause
    const HandleAudioPause = () => {
      refs?.current?.["audio_btn"]?.classList?.remove?.('play')
    }

    window.addEventListener('click', ModalControl)

    // audio events
    refs?.current?.['audio_tag']?.addEventListener?.("timeupdate", HandleTimeAudio)

    refs?.current?.['audio_tag']?.addEventListener?.("durationchange", HandleDurationAudio)

    refs?.current?.['audio_tag']?.addEventListener?.('pause', HandleAudioPause)

    refs?.current?.['audio_tag']?.addEventListener?.('play', HandleAudioPlay)

    return () => {
      window.removeEventListener('click', ModalControl)

      // audio events
      refs?.current?.['audio_tag']?.removeEventListener?.("timeupdate", HandleTimeAudio)

      refs?.current?.['audio_tag']?.removeEventListener?.("durationchange", HandleDurationAudio)

      refs?.current?.['audio_tag']?.removeEventListener?.('pause', HandleAudioPause)

      refs?.current?.['audio_tag']?.removeEventListener?.('play', HandleAudioPlay)
    }
  }, [state?.msgs]);

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
            <img src={`/files/profiles/${details?.img}`} alt="profile" />
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
        <div className="actions">
          {
            // for groups
            <button>
              <PlusSvg width={"19px"} height={"19px"} />
            </button>
          }
          <button>
            <PhoneSvg width={"18px"} height={"18px"} />
          </button>
          <button>
            <VideoSvg width={"25px"} height={"25px"} />
          </button>
        </div>
      </div>

      <div className="body">

        <div data-for="modal_outer" ref={(elm) => {
          if (refs?.current) {
            refs.current.modal_msgs = elm

            if (refs?.current?.['audio_seekbar']?.classList?.contains('modal_audio_seekBar')) {
              refs?.current?.['audio_tag']?.pause?.()
            }
          }
        }}>
          <div className="inner_modal">
            {/* <div className="scroll_bar" >
                <img src="https://images.mktw.net/im-764473?width=1280&size=1" ref={(elm) => {
                  if (refs?.current) {
                    refs.current.modal_scroll_img = elm
                  }
                }} onClick={() => {
                  if (refs?.current?.modal_scroll_img?.classList?.contains?.('zoom')) {
                    refs?.current?.modal_scroll_img?.classList?.remove?.('zoom')
                  } else {
                    refs?.current?.modal_scroll_img?.classList?.add?.('zoom')
                  }
                }} />
              </div> */}

            {/* <video controls src="https://www.learningcontainer.com/download/sample-mp4-video-file-download-for-testing/?wpdmdl=2727&refresh=64d1d134e3c431691472180" /> */}

            {/* <div className="audio">
                <button
                  className="modal_audio_btn"
                  onClick={(e) => {
                    document?.querySelectorAll?.("button[class*='audio_btn']")?.forEach((elm) => {
                      if (elm?.classList?.contains?.(`modal_audio_btn`)) {

                        if (elm?.classList?.contains?.("play")) {
                          refs?.current?.audio_tag?.pause?.()
                        } else {

                          refs.current.audio_btn = elm

                          refs.current.audio_seekbar = elm?.parentElement?.querySelector('input')

                          refs.current.audio_tag.src = elm?.getAttribute('src')
                          refs?.current?.audio_tag?.play?.()
                        }
                      } else {
                        elm?.classList?.remove("play")
                      }
                    })
                  }}
                  type="button"
                  src="/song.mp3"
                >
                  <PlaySvg />
                  <PauseSvg />
                </button>
                <input
                  type="range"
                  step="any"
                  onChange={(e) => {
                    if (refs?.current?.audio_seekbar &&
                      refs?.current?.audio_seekbar?.classList?.contains(`modal_audio_seekBar`)) {

                      AudioTimeChange(e?.target?.value)
                    } else {
                      const button = e?.target?.parentElement?.querySelector('button')

                      document?.querySelectorAll?.("button[class*='audio_btn']")?.forEach((elm) => {
                        if (!elm?.classList?.contains(`modal_audio_btn`)) {
                          elm.classList.remove('play')
                        }
                      })

                      refs.current.audio_btn = button

                      refs.current.audio_seekbar = e?.target

                      refs.current.audio_tag.src = button?.getAttribute('src')

                      refs?.current?.audio_tag?.play?.()
                    }
                  }}
                  className="non_active modal_audio_seekBar"
                />
              </div> */}

            {true && <form onSubmit={(e) => {
              onChat(e, true)
            }}>
              <div className="upload">
                <input className="file_input_box" onInput={() => {
                  refs?.current?.modal_msgs?.classList?.add?.("active")
                }} type="file" accept="image/* , video/* , audio/*" />

                <ClipSvg />
              </div>
              <button type="button" onClick={() => refs?.current?.modal_msgs?.classList?.remove?.("active")}>
                <Xsvg class_name={"svg_path_fill"} />
              </button>
              <button type="submit">
                <SendSvg
                  class_name={"svg_path_stroke"}
                />
              </button>
            </form>}
          </div>
        </div>

        <div
          className="messages"
          ref={(elm) => {
            if (refs?.current) {
              refs.current.main = elm;
            }
          }}
        >
          <LoadingCircle ref={refs} />

          {state?.msgs?.map((obj, key) => {
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

                      <div className="msg">{obj?.msg}</div>
                    </div>

                    <div className="actions-msg">
                      <button onClick={() => window.alert("click")}>
                        <TrashSvg />
                      </button>
                      <button
                        onClick={() => {
                          window?.navigator?.clipboard?.writeText?.(obj?.msg);
                          window?.alert?.("Text Copied");
                        }}
                      >
                        <CopySvg class_name={"path_fill"} />
                      </button>
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
                    {details?.img ? (
                      <img
                        src={`/files/profiles/${details?.img}`}
                        alt="profile"
                      />
                    ) : (
                      <AvatarSvg />
                    )}
                  </div>
                  <div className="card actionable">
                    <div className="inner">
                      <div className="from">
                        <p className="author">{details?.name}</p>
                        <p className="time">{obj?.date}</p>
                      </div>

                      <div className="msg">
                        {/* <img src="https://images.mktw.net/im-764473?width=1280&size=1" /> */}
                        {obj?.msg}
                      </div>
                    </div>

                    <div className="actions-msg">
                      <button
                        onClick={() => {
                          window?.navigator?.clipboard?.writeText?.(obj?.msg);
                          window?.alert?.("Text Copied");
                        }}
                      >
                        <CopySvg class_name={"path_fill"} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
          })}

          <div className="others">
            <div className="cover">
              <img
                src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
                alt="profile"
              />
            </div>
            <div className="card">
              <div className="inner">
                <div className="from">
                  <p className="author">Anson</p>
                  <p className="time">08:35</p>
                </div>

                <div className="msg">
                  <img
                    className="img_for_modal"
                    onClick={() => {
                      if (refs?.current?.modal_msgs) {
                        refs.current.modal_msgs.className = 'active'
                      }
                    }}
                    src="https://images.mktw.net/im-764473?width=1280&size=1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="others">
            <div className="cover">
              <img
                src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
                alt="profile"
              />
            </div>
            <div className="card">
              <div className="inner">
                <div className="from">
                  <p className="author">Anson</p>
                  <p className="time">08:35</p>
                </div>

                <div className="msg">
                  <video controls src="https://www.learningcontainer.com/download/sample-mp4-video-file-download-for-testing/?wpdmdl=2727&refresh=64d1d134e3c431691472180" />
                </div>
              </div>
            </div>
          </div>

          <div className="others">
            <div className="cover">
              <img
                src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
                alt="profile"
              />
            </div>
            <div className="card">
              <div className="inner">
                <div className="from">
                  <p className="author">Anson</p>
                  <p className="time">08:35</p>
                </div>

                <div className="msg">
                  <div className="audio">
                    <button
                      className="123_audio_btn audio_btn"
                      onClick={(e) => {
                        document?.querySelectorAll?.("button[class*='audio_btn']")?.forEach((elm) => {
                          if (elm?.classList?.contains?.(`${123}_audio_btn`)) {

                            if (elm?.classList?.contains?.("play")) {
                              refs?.current?.audio_tag?.pause?.()
                            } else {

                              refs.current.audio_btn = elm

                              refs.current.audio_seekbar = elm?.parentElement?.querySelector('input')

                              refs.current.audio_tag.src = elm?.getAttribute('src')
                              refs?.current?.audio_tag?.play?.()
                            }
                          } else {
                            elm?.classList?.remove("play")
                          }
                        })
                      }}
                      type="button"
                      src="/song.mp3"
                    >
                      <PlaySvg />
                      <PauseSvg />
                    </button>
                    <input
                      type="range"
                      step="any"
                      onChange={(e) => {
                        if (refs?.current?.audio_seekbar &&
                          refs?.current?.audio_seekbar?.classList?.contains(`${123}_seekBar`)) {

                          AudioTimeChange(e?.target?.value)
                        } else {
                          const button = e?.target?.parentElement?.querySelector('button')

                          document?.querySelectorAll?.("button[class*='audio_btn']")?.forEach((elm) => {
                            if (!elm?.classList?.contains(`${123}_audio_btn`)) {
                              elm.classList.remove('play')
                            }
                          })

                          refs.current.audio_btn = button

                          refs.current.audio_seekbar = e?.target

                          refs.current.audio_tag.src = button?.getAttribute('src')

                          refs?.current?.audio_tag?.play?.()
                        }
                      }}
                      className="non_active 123_seekBar"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="others">
            <div className="cover">
              <img
                src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
                alt="profile"
              />
            </div>
            <div className="card">
              <div className="inner">
                <div className="from">
                  <p className="author">Anson</p>
                  <p className="time">08:35</p>
                </div>

                <div className="msg">
                  <div className="audio">
                    <button
                      className="1234_audio_btn audio_btn"
                      onClick={(e) => {
                        document?.querySelectorAll?.("button[class*='audio_btn']")?.forEach((elm) => {
                          if (elm?.classList?.contains?.(`${1234}_audio_btn`)) {

                            if (elm?.classList?.contains?.("play")) {
                              refs?.current?.audio_tag?.pause?.()
                            } else {
                              refs.current.audio_btn = elm

                              refs.current.audio_seekbar = elm?.parentElement?.querySelector('input')

                              refs.current.audio_tag.src = elm?.getAttribute('src')
                              refs?.current?.audio_tag?.play?.()
                            }
                          } else {
                            elm?.classList?.remove("play")
                          }
                        })
                      }}
                      type="button"
                      src="/song.mp3"
                    >
                      <PlaySvg />
                      <PauseSvg />
                    </button>
                    <input
                      type="range"
                      step="any"
                      onChange={(e) => {
                        if (refs?.current?.audio_seekbar &&
                          refs?.current?.audio_seekbar?.classList?.contains(`${1234}_seekBar`)) {

                          AudioTimeChange(e?.target?.value)
                        } else {
                          const button = e?.target?.parentElement?.querySelector('button')

                          document?.querySelectorAll?.("button[class*='audio_btn']")?.forEach((elm) => {
                            if (!elm?.classList?.contains(`${1234}_audio_btn`)) {
                              elm.classList.remove('play')
                            }
                          })

                          refs.current.audio_btn = button

                          refs.current.audio_seekbar = e?.target

                          refs.current.audio_tag.src = button?.getAttribute('src')

                          refs?.current?.audio_tag?.play?.()
                        }
                      }}
                      className="non_active 1234_seekBar"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="textarea">
          <form className="border" onSubmit={onChat}>
            <button type="button" className="file_upload" onClick={() => {
              refs?.current?.['modal_msgs']?.classList?.add?.('active', "form")
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
        if (refs?.current) {
          refs.current.audio_tag = elm
        }
      }} />
    </section>
  );
});

export default ChatLive;
