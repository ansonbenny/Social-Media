import React, {
  forwardRef,
  useEffect,
  useImperativeHandle
} from "react";
import {
  AvatarSvg,
  ClipSvg,
  CopySvg,
  PhoneSvg,
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

  useEffect(() => {
    if (state?.new) {
      refs?.current?.main?.scroll?.(0, refs?.current?.main?.scrollHeight);
    } else {
      refs?.current?.main?.scroll?.(0, 30);
    }

    const ModalControl = (e) => {
      const inner = refs?.current?.modal_msgs?.querySelector('.inner_modal')
      if (!inner?.contains(e?.target) && !e?.target?.classList?.contains("img_for_modal")) {
        refs?.current?.modal_msgs?.classList?.remove?.("active")
      }
    }

    window.addEventListener('click', ModalControl)

    return () => {
      window.removeEventListener('click', ModalControl)
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
          }
        }}>
          <div className="fake_bg" />
          <div data-for="modal">
            <div className="inner_modal">
              <div className="scroll_bar" >
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
              </div>

              {false && <form>
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

          {
            /*
            <div className="me">
              <div className="card">
                <div className="inner">
                  <div className="from">
                    <p className="author">You</p>
                    <p className="time">08:30</p>
                  </div>
  
                  <div className="msg">
                    <img src="https://images.mktw.net/im-764473?width=1280&size=1" />
                  </div>
                </div>
  
                <div className="actions-msg">
                  <button onClick={() => window.alert("click")}>
                    <TrashSvg />
                  </button>
                </div>
              </div>
  
              <div className="cover">
                <img
                  src="https://yt3.googleusercontent.com/ytc/AGIKgqPh9kVptaKpovayOfZGjfyZV7DExqpIUitIiTlKuQ=s900-c-k-c0x00ffffff-no-rj"
                  alt="profile"
                />
              </div>
            </div>
             
            <div className="others">
              <div className="cover">
                <img
                  src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
                  alt="profile"
                />
              </div>
              <div className="card actionable">
                <div className="inner">
                  <div className="from">
                    <p className="author">Anson</p>
                    <p className="time">08:30</p>
                  </div>
  
                  <div className="msg">Iam Fine, How is today going</div>
                </div>
  
                <div className="actions-msg">
                  <button onClick={() => window.alert("click")}>
                    <CopySvg class_name={"path_fill"} />
                  </button>
                </div>
              </div>
            </div>
  
            <div className="me">
              <div className="card">
                <div className="inner">
                  <div className="from">
                    <p className="author">You</p>
                    <p className="time">08:30</p>
                  </div>
  
                  <div className="msg">Today is good not bad.</div>
                </div>
  
                <div className="actions-msg">
                  <button onClick={() => window.alert("click")}>
                    <TrashSvg />
                  </button>
                  <button onClick={() => window.alert("click")}>
                    <CopySvg class_name={"path_fill"} />
                  </button>
                </div>
              </div>
  
              <div className="cover">
                <img
                  src="https://yt3.googleusercontent.com/ytc/AGIKgqPh9kVptaKpovayOfZGjfyZV7DExqpIUitIiTlKuQ=s900-c-k-c0x00ffffff-no-rj"
                  alt="profile"
                />
              </div>
            </div>
  
            <div className="others">
              <div className="cover">
                <img
                  src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
                  alt="profile"
                />
              </div>
              <div className="card actionable">
                <div className="inner">
                  <div className="from">
                    <p className="author">Anson</p>
                    <p className="time">08:35</p>
                  </div>
  
                  <div className="msg">
                    How is my articles, Lorem Ipsum is simply dummy text of the
                    printing and typesetting industry. Lorem Ipsum has been the
                    industry's standard dummy text ever since the 1500s, when an
                    unknown printer took a galley of type and scrambled it to make
                    a type specimen book. It has survived not only five centuries,
                    but also the leap into electronic typesetting, remaining
                    essentially unchanged. It was popularised in the 1960s with
                    the release of Letraset sheets containing Lorem Ipsum
                    passages, and more recently with desktop publishing software
                    like Aldus PageMaker including versions of Lorem Ipsum
                  </div>
                </div>
  
                <div className="actions-msg">
                  <button onClick={() => window.alert("click")}>
                    <CopySvg class_name={"path_fill"} />
                  </button>
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
                    <img src="https://images.mktw.net/im-764473?width=1280&size=1" />
                  </div>
                </div>
              </div>
            </div>  */
          }

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
                    onClick={() => refs?.current?.modal_msgs?.classList?.add?.("active")}
                    src="https://images.mktw.net/im-764473?width=1280&size=1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="textarea">
          <form className="border" onSubmit={onChat}>
            <div data-for="select_file_div">
              <input className="file_input_box" onInput={() => {
                refs?.current?.modal_msgs?.classList?.add?.("active")
              }} type="file" accept="image/* , video/* , audio/*" />
              <ClipSvg class_name={"svg_fill"} />
            </div>
            <input onInput={onInput} placeholder="Type Something..." />
            <button type="submit">
              <SendSvg
                class_name={"svg_path_stroke"}
              />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
});

export default ChatLive;
