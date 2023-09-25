import React, { Fragment, forwardRef, useEffect, useImperativeHandle } from "react";
import { AvatarSvg, PlusSvg, SearchSvg } from "../../assets";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingCircle, Modal } from "..";
import { axios } from "../../lib";
import { useSelector } from "react-redux";
import { useScroll } from "../../hooks";
import "./style.scss";

const Users = forwardRef(({ stories, isUsers }, ref) => {
  const { id } = useParams()

  const navigate = useNavigate();

  const user = useSelector((state) => state?.user)

  const [refs, state, action] = useScroll({
    url: isUsers ? `/chat-single/recent_users_more` : stories ? `/stories/get_users` : `/chat-group/recent_groups_more`,
    search_url: isUsers ? `/chat-single/search_users` : `/chat-group/get_groups_search`
  })

  const OnInput = async (e) => {
    if (refs?.current?.abort_search) {
      refs.current.abort_search?.abort?.()
    }

    const abortController = new AbortController();

    refs.current.abort_search = abortController;

    try {
      let res;

      if (isUsers) {
        res = await axios.get('/chat-single/search_users', {
          params: {
            search: e?.target?.value
          },
          signal: abortController?.signal
        })
      } else {
        res = await axios.get('/chat-group/get_groups_search', {
          params: {
            search: e?.target?.value
          },
          signal: abortController?.signal
        })
      }

      if (res?.['data']?.data?.recent) {
        action({
          type: "initial_search", data: {
            items: res?.['data']?.data?.items,
            total: res?.['data']?.data?.total
          }
        })
      } else {
        action({
          type: "initial_search", data: {
            items: res?.['data']?.data?.items,
            search: e?.target?.value || ' '
          }
        })
      }

    } catch (err) {
      if (err?.code !== "ERR_CANCELED") {
        ref?.current?.loading?.classList?.add?.("hide");

        if (err?.response?.data?.status == 405) {
          navigate("/");
        } else {
          alert(err?.response?.data?.message || "Something Went Wrong");
        }
      }
    }

  }

  useImperativeHandle(ref, () => ({
    users_status: (data) => {
      action({ type: "status", data })
    },
    readMsgs: (data) => {
      action({ type: "readed", data: data?.from })
    },
    pushToTop: async (data, isGroup) => {
      if (!state?.items?.find((obj) => obj?.id == data?.id)) {
        if (isGroup) {
          action({ type: "new_user", data })
        } else {
          try {
            let res = await axios.get('/chat-single/user_details', {
              params: {
                chatId: data?.id
              }
            })

            action({
              type: "new_user", data: {
                ...res?.['data']?.data,
                status: data?.status == 'online' ? true : data?.status ? false : res?.['data']?.data?.status
              }
            })
          } catch (err) {
            console.log("something went wrong")
          }
        }
      } else {
        action({ type: "to_top", data: data?.id })

        if (data?.unReadMsgs) {
          action({ type: "unread", data: data?.id })
        }
      }
    },
    update_details: (data) => {
      action({ type: "update_details", data })
    }
  }), [])

  useEffect(() => {
    let abortControl = new AbortController();

    (async () => {
      try {
        let res;

        if (isUsers) {
          res = await axios.get("/chat-single/recent_users", {
            signal: abortControl?.signal
          })
        } else if (stories) {
          res = await axios.get("/stories/get_users", {
            signal: abortControl?.signal
          })
        } else {
          res = await axios.get("/chat-group/get_groups", {
            signal: abortControl?.signal
          })
        }

        action({ type: "initial", data: res?.['data']?.data })
      } catch (err) {
        if (err?.code !== "ERR_CANCELED") {
          alert(err?.response?.data?.message || "Something Went Wrong to Fetch Chats");
        }
      }
    })();

    return () => {
      abortControl?.abort?.()
    }
  }, [isUsers, id])

  return (
    <section id="all-users">

      {
        !stories && !isUsers ?
          <Modal ref={(elm) => {
            if (refs?.current) {
              refs.current.group_modal = elm
            }
          }} />
          : null
      }

      {!stories && (
        <Fragment>
          <div className="title">
            <h1>
              Messages <span>({state?.total || 0})</span>
            </h1>
          </div>

          <div className="search">
            <SearchSvg width={"22px"} height={"22px"} />
            <input type="text" placeholder="Search" onInput={OnInput} />
          </div>
        </Fragment>
      )}

      <div className="list" ref={(elm) => {
        if (refs?.current) {
          refs.current.main = elm
        }
      }}>

        {
          stories || isUsers ? <div
            className={`card ${id && id == user?._id ? "active" : ""}`}
            onClick={() => {
              if (stories) {
                navigate(`/stories/${user?._id}`)
              } else {
                navigate(`/chat/${user?._id}`)
              }
            }}
          >
            <div className="cover">
              {
                user?.img ? <img
                  src={`/files/profiles/${user?.img}`}
                  alt="profile"
                />
                  : <AvatarSvg />
              }

              {
                isUsers && <div data-for="status" />
              }
            </div>
            <div className="content">
              <h1>(You) {user?.name}</h1>
              <p>
                {user?.about}
              </p>
            </div>

          </div>
            : null
        }

        {state?.items?.map((obj, key) => {
          if (obj?.id !== user?._id) {
            return (
              <div className={`card ${id && id == obj?.id ? "active" : ""}`} key={key}
                onClick={() => {
                  if (isUsers) {
                    navigate(`/chat/${obj?.id}`)
                  } else if (stories) {
                    navigate(`/stories/${obj?.id}`)
                  } else {
                    navigate(`/groups/${obj?.id}`)
                  }
                }}>
                <div className="cover">
                  {
                    obj?.details?.img ? <img
                      src={obj?.details?.img?.url ? obj?.details?.img?.url : `/files/profiles/${obj?.details?.img}`}
                      alt="profile"
                    />
                      : <AvatarSvg />
                  }

                  {
                    obj?.status && <div data-for="status" />
                  }
                </div>

                <div className="content">
                  <h1>{obj?.details?.name}</h1>
                  <p>
                    {obj?.details?.about}
                  </p>
                </div>

                {
                  obj?.unread && (
                    <button className="count" type="button">
                      {obj?.unread}
                    </button>
                  )
                }
              </div>
            );
          }
        })}

        <LoadingCircle ref={refs} />
      </div>

      {
        !stories && !isUsers ?
          <button data-for="group_create_btn" onClick={() => {
            refs?.current?.group_modal?.Modal(undefined, {
              create: true
            })
          }} className="chats_modal_special" >
            <PlusSvg />
          </button>
          : null
      }
    </section>
  );
});

export default Users;
