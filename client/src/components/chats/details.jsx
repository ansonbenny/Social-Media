import React, { forwardRef, useEffect, useImperativeHandle, useReducer, useRef } from "react";
import {
  AvatarSvg,
  ChatsSvg,
  HeadsetSvg,
  ParticleSvg,
  PenSvg,
  PhoneSvg,
  PlaySvg,
  PlusSvg,
  TrashSvg,
  VideoSvg,
  Xsvg,
} from "../../assets";
import Modal from "./modal";
import { axios } from "../../lib";
import { useNavigate } from "react-router-dom";
import "./style.scss";

const reducer = (values, { type, data }) => {
  switch (type) {
    case "initial_media":
      return { ...values, media: data }
    case "media_new":
      return { ...values, media: { total: data?.total, files: [...values?.media?.files, ...data?.files] } }
    default:
      return values
  }
}

const ChatDetails = forwardRef(({ setModal, isUser, details }, ref) => {
  const navigate = useNavigate();

  const modalRef = useRef()

  const [state, action] = useReducer(reducer, {})

  const LoadMedia = async (abortControl, offset) => {
    if (isUser) {
      try {
        let res = await axios.get('/chat-single/get_media', {
          params: {
            chatId: details?._id,
            offset
          },
          signal: abortControl?.signal
        })

        if (res?.['data'] && !offset) {
          action({ type: "initial_media", data: res?.['data']?.data })
        } else if (res?.['data'] && offset) {
          action({ type: "media_new", data: res?.['data']?.data })
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

  const DeleteChat = async () => {
    if (window.confirm("Do you want delete entire chat ?")) {
      try {
        if (isUser) {
          await axios.delete('/chat-single/delete_chat', {
            data: {
              chatId: details?._id
            }
          })
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
    ReloadMedia: () => {
      LoadMedia?.()
    }
  }), [])

  useEffect(() => {
    const abortControl = new AbortController()

    // update media when new file recieved / sented / deleted call axios

    LoadMedia?.(abortControl)

    // create another function for members

    return () => {
      abortControl?.abort?.()
    }
  }, [details]);

  return (
    <section
      className={`details-chat ${setModal ? "modal-details-chat" : null}`}
    >
      {setModal && (
        <div className="exit">
          <button
            onClick={() => {
              setModal?.();
            }}
          >
            <Xsvg />
          </button>
        </div>
      )}
      <div className="scrollable">
        <Modal ref={modalRef} />
        <div className="basic">
          <div className="cover">
            {details?.img ? (
              <img
                onClick={() => {
                  window.open(details?.img?.url ? details?.img?.url : `/files/profiles/${details?.img}`, "_blank");
                }}
                src={details?.img?.url ? details?.img?.url : `/files/profiles/${details?.img}`}
                alt="profile"
              />
            ) : (
              <AvatarSvg />
            )}
          </div>
          <h1>{details?.name}</h1>
          <p className="status">{details?.status || "offline"}</p>

          <div className={`more_actions ${!details?.user ? 'left' : ''}`}>
            <button
              onClick={() => {
                setModal?.((state) => ({
                  ...state,
                  details: false,
                }));
              }}
            >
              <ChatsSvg width={"20px"} height={"20px"} />
            </button>
            {
              isUser && (
                <>
                  <button>
                    <PhoneSvg width={"18px"} height={"18px"} />
                  </button>
                  <button>
                    <VideoSvg width={"20px"} height={"20px"} />
                  </button>
                </>)
            }
            <button onClick={DeleteChat}>
              <TrashSvg isFull width={"18px"} height={"18px"} />
            </button>

            {
              details?.isAdmin && <button className="chats_modal_special" onClick={() => {
                modalRef?.current?.Modal?.(undefined, details)
              }} >
                <PenSvg width={'20px'} height={'20px'} />
              </button>
            }
          </div>

          <div className="description">
            <h1>Id</h1>
            <p>{details?._id}</p>

            {
              details?.user && (
                <>
                  <h1>Number</h1>
                  <p>{details?.number}</p>
                </>
              )
            }

            <h1>Description</h1>
            <p>{details?.about}</p>
          </div>
        </div>

        {
          state?.media?.total > 0 && <div className="media">
            <h1>
              <ParticleSvg />
              Shared Media
              <span>({state?.media?.total} items)</span>
            </h1>
            <div className="grid">
              {
                state?.media?.files?.map((obj, key) => {
                  if (/image/i.test(obj?.file?.type)) {
                    return (
                      <img key={key} className="chats_modal_special" src={obj?.file?.url} alt={obj?.id} onClick={() => {
                        modalRef?.current?.Modal?.(obj?.file)
                      }} />
                    )
                  } else {
                    return (<div className="extra_file chats_modal_special" key={key} onClick={() => {
                      modalRef?.current?.Modal?.(obj?.file)
                    }}>
                      {/video/i.test(obj?.file?.type) && <PlaySvg />}
                      {/audio/i.test(obj?.file?.type) && <HeadsetSvg />}
                    </div>)
                  }
                })
              }
            </div>

            {
              state?.media?.total > state?.media?.files?.length && <button
                onClick={() => {
                  LoadMedia(undefined, state?.media?.files?.length)
                }}
              >View More</button>
            }
          </div>
        }

        {!isUser && (
          <div className="members">
            <div className="top">
              <h1>
                <AvatarSvg width={"20px"} height={"20px"} />
                Members
                <span>(22)</span>
              </h1>
              {
                details?.isAdmin && <button>
                  <PlusSvg />
                </button>
              }
            </div>

            <div className="list">
              <div className="member">
                <div className="cover">
                  <img
                    src="https://yt3.googleusercontent.com/ytc/AGIKgqPh9kVptaKpovayOfZGjfyZV7DExqpIUitIiTlKuQ=s900-c-k-c0x00ffffff-no-rj"
                    alt="profile"
                  />
                </div>
                <div className="content">
                  <h1>Ajith George</h1>
                </div>
                <div className="role">Owner</div>
              </div>

              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]?.map(
                (obj, key) => {
                  return (
                    <div className="member user" key={key}>
                      <div className="cover">
                        <img
                          src="https://yt3.googleusercontent.com/ytc/AGIKgqPh9kVptaKpovayOfZGjfyZV7DExqpIUitIiTlKuQ=s900-c-k-c0x00ffffff-no-rj"
                          alt="profile"
                        />
                      </div>
                      <div className="content">
                        <h1>Ajith George {obj}</h1>
                      </div>
                      <div className="role">User</div>

                      <button>Remove</button>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export default ChatDetails;
