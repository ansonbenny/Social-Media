import React, { Fragment, forwardRef, useEffect, useImperativeHandle } from "react";
import { AvatarSvg, PlusSvg, SearchSvg } from "../../assets";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingCircle } from "..";
import { axios } from "../../lib";
import { useSelector } from "react-redux";
import { useScroll } from "../../hooks";
import Modal from "../chats/modal";
import "./style.scss";

const Users = forwardRef(({ selected, stories, isUsers }, ref) => {
  const { id } = useParams()

  const navigate = useNavigate();

  const user = useSelector((state) => state?.user)

  const [refs, state, action] = useScroll({
    url: `/chat-single/recent_users_more`,
    search_url: `/chat-single/search_users`
  })

  const OnInput = async (e) => {
    if (refs?.current?.abort_search) {
      refs.current.abort_search?.abort?.()
    }

    refs.current.abort_search = new AbortController()

    if (isUsers) {
      try {
        const res = await axios.get('/chat-single/search_users', {
          params: {
            search: e?.target?.value
          },
          signal: refs?.current?.abort_search?.signal
        })

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
  }

  useImperativeHandle(ref, () => ({
    users_status: (data) => {
      action({ type: "status", data })
    },
    readMsgs: (data) => {
      action({ type: "readed", data: data?.from })
    },
    pushToTop: async (data) => {
      if (!state?.items?.find((obj) => obj?.id == data?.id)) {
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
      } else {
        action({ type: "to_top", data: data?.id })
      }
    },
    unReadMsgs: async (data) => {
      if (!state?.items?.find((obj) => obj?.id == data?.from)) {
        try {
          let res = await axios.get('/chat-single/user_details', {
            params: {
              chatId: data?.from
            }
          })

          action({
            type: "new_user", data: res?.['data']?.data, unread: true
          })
        } catch (err) {
          console.log("something went wrong")
        }
      } else {
        action({ type: "unread", data: data?.from })
      }
    }
  }), [])

  useEffect(() => {
    let abortControl = new AbortController();

    if (isUsers) {
      (async () => {
        try {
          let res = await axios.get("/chat-single/recent_users", {
            signal: abortControl?.signal
          })

          action({ type: "initial", data: res?.['data']?.data })
        } catch (err) {
          if (err?.code !== "ERR_CANCELED") {
            alert(err?.response?.data?.message || "Something Went Wrong to Fetch Chats");
          }
        }
      })();
    }

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

      {!selected && (
        <div className="stories-recent">
          <div className="item">
            <img
              src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
              alt="profile"
            />
          </div>

          <div className="item">
            <img
              src="https://img.i-scmp.com/cdn-cgi/image/fit=contain,width=425,format=auto/sites/default/files/styles/768x768/public/d8/images/methode/2021/01/11/d5ed0832-5001-11eb-ad83-255e1243236c_image_hires_113755.jpg?itok=6PsAhoy2&v=1610336282"
              alt="profile"
            />
          </div>
        </div>
      )}

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
            onClick={() => navigate(`/chat/${user?._id}`)}
          >
            <div className="cover">
              {
                user?.img ? <img
                  src={`/files/profiles/${user?.img}`}
                  alt="profile"
                />
                  : <AvatarSvg />
              }
              <div data-for="status" />
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
                onClick={() => navigate(`/chat/${obj?.id}`)}>
                <div className="cover">
                  {
                    obj?.details?.img ? <img
                      src={`/files/profiles/${obj?.details?.img}`}
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
