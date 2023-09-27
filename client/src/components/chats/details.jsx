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
import { Modal } from "../";
import { axios } from "../../lib";
import { useNavigate } from "react-router-dom";
import "./style.scss";

const reducer = (values, { type, data }) => {
  switch (type) {
    case "initial_media":
      return { ...values, media: data }
    case "media_new":
      return { ...values, media: { total: data?.total, files: [...values?.media?.files, ...data?.files] } }
    case "initial_members":
      return { ...values, members: data }
    case "members_new":
      return { ...values, members: { total: data?.total, users: [...values?.members?.users, ...data?.users] } }
    default:
      return values
  }
}

const ChatDetails = forwardRef(({ setModal, isUser, details }, ref) => {
  const navigate = useNavigate();

  const modalRef = useRef()

  const [state, action] = useReducer(reducer, {})

  const LoadMedia = async (abortControl, offset) => {
    try {
      let res;

      if (isUser) {
        res = await axios.get('/chat-single/get_media', {
          params: {
            chatId: details?._id,
            offset
          },
          signal: abortControl?.signal
        })
      } else {
        res = await axios.get('/chat-group/get_media', {
          params: {
            groupId: details?._id,
            offset
          },
          signal: abortControl?.signal
        })
      }

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

  const LoadMembers = async (abortControl, offset) => {
    if (!isUser && details?._id) {
      try {
        let res = await axios.get('/chat-group/get_members', {
          params: {
            groupId: details?._id,
            offset
          },
          signal: abortControl?.signal
        })

        if (res?.['data'] && !offset) {
          action({ type: "initial_members", data: res?.['data']?.data })
        } else if (res?.['data'] && offset) {
          action({ type: "members_new", data: res?.['data']?.data })
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

  const DeleteChat = async (e, remove) => {
    if (window.confirm(remove ? "Do you want remove user?" : "Do you want delete entire chat ?")) {
      try {
        if (isUser) {
          await axios.delete('/chat-single/delete_chat', {
            data: {
              chatId: details?._id
            }
          })
        } else if (details?.isAdmin) {
          if (!remove) {
            await axios.delete('/chat-group/delete_chat', {
              data: {
                groupId: details?._id
              }
            })
          } else {

            // for remove user from group

            await axios.delete(`/chat-group/remove_member/${details?._id}`, {
              data: {
                groupId: details?._id,
                remove
              }
            })
          }
        } else {
          await axios.delete(`/chat-group/exit_group/${details?._id}`)
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
    },
    ReloadMembers: () => {
      LoadMembers?.()
    }
  }), [])

  useEffect(() => {
    const abortControl = new AbortController()

    // update media & memebers reload, when new file recieved / sented / deleted call axios

    LoadMedia?.(abortControl)

    LoadMembers?.(abortControl)

    return () => {
      abortControl?.abort?.()
    }
  }, [details]);

  return (
    <section
      className={`details-chat ${setModal ? "modal-details-chat" : null}`}
    >
      <Modal ref={modalRef} />

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
        <div className="basic">
          <div className="cover">
            {details?.img ? (
              <img
                className="chats_modal_special"
                onClick={() => {
                  modalRef?.current?.Modal?.({
                    url: details?.img?.url || `/files/profiles/${details?.img}`,
                    type: "image"
                  })
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

          <div className={`more_actions ${!details?.user ? 'left' : details?.me && 'left'}`}>
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
              isUser && !details?.me ? (
                <>
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
                    <VideoSvg width={"20px"} height={"20px"} />
                  </button>
                </>)
                : null
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
                <span>({state?.members?.total})</span>
              </h1>
              {
                details?.isAdmin && <button className="chats_modal_special" onClick={() => {
                  modalRef?.current?.Modal?.(undefined, {
                    _id: details?._id,
                    members: true
                  })
                }}>
                  <PlusSvg />
                </button>
              }
            </div>

            <div className="list">

              {state?.members?.users?.map(
                (obj, key) => {
                  return (
                    <div className={`member ${!obj?.isAdmin && details?.isAdmin ? "user" : ''}`} key={key}>
                      <div className="cover">
                        {
                          obj?.img ? <img
                            src={`/files/profiles/${obj?.img}`}
                            alt="profile"
                          />
                            : <AvatarSvg />
                        }
                      </div>
                      <div className="content">
                        <h1>{obj?.name}</h1>
                      </div>
                      <div className="role">{obj?.isAdmin ? 'Owner' : 'User'}</div>

                      {!obj?.isAdmin && details?.isAdmin ? <button onClick={() => {
                        DeleteChat(null, obj?._id)
                      }}>Remove</button> : null}
                    </div>
                  );
                }
              )}

              {
                state?.members?.total > state?.members?.users?.length && (
                  <button data-for="load"
                    onClick={() => {
                      LoadMembers(undefined, state?.members?.users?.length)
                    }}
                  >View More</button>
                )
              }
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export default ChatDetails;
