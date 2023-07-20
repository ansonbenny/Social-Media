import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
} from "react";
import {
  AvatarSvg,
  ClipSvg,
  CopySvg,
  PhoneSvg,
  PlusSvg,
  SendSvg,
  TrashSvg,
  VideoSvg,
} from "../../assets";
import { useSelector } from "react-redux";
import "./style.scss";

const reducer = (state, { type, data }) => {
  switch (type) {
    case "initial":
      return data;
    case "new":
      if (!state?.find?.((obj) => obj?.id == data?.id)) {
        return [...state, data];
      } else {
        return state;
      }
    default:
      return state;
  }
};

const ChatLive = forwardRef(({ setModal, onChat, details }, ref) => {
  const messagesRef = useRef();

  const user = useSelector((state) => state?.user);

  const [messages, action] = useReducer(reducer, []);

  useImperativeHandle(ref, () => ({
    insertMsg: (data) => {
      action({ type: "new", data });
    },
    insertInitial: (data) => {
      action({ type: "initial", data });
    },
  }));

  useEffect(() => {
    messagesRef?.current?.scroll?.(0, messagesRef?.current?.scrollHeight);
  }, [messages]);

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
        <div className="messages" ref={messagesRef}>
          {/* <div className="others">
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
                  <p className="time">09/03/2023 08:30</p>
                </div>

                <div className="msg">Hello Ajith.</div>
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

                <div className="msg">Hello How Are You</div>
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
          </div> */}

          {messages?.map((obj, key) => {
            if (obj?.from == user?._id) {
              return (
                <div className="me" key={key}>
                  <div className="card">
                    <div className="inner">
                      <div className="from">
                        <p className="author">You</p>
                        <p className="time">{obj?.date}</p>
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
        </div>

        <div className="textarea">
          <form className="border" onSubmit={onChat}>
            <button type="button">
              <ClipSvg width={"18px"} height={"18px"} class_name={"svg_fill"} />
            </button>
            <input placeholder="Type Something..." />
            <button type="submit">
              <SendSvg
                width={"18px"}
                height={"18px"}
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
