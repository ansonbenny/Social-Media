import React, { Fragment, forwardRef, useEffect, useImperativeHandle, useReducer } from "react";
import { AvatarSvg, SearchSvg } from "../../assets";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LoadingCircle } from "..";
import { axios } from "../../lib";
import { useSelector } from "react-redux";
import "./style.scss";

const reducer = (value, { type, data, ...actions }) => {
  switch (type) {
    case "initial":
      return data
    case "status":
      return {
        ...value, users: value?.users?.map((users) => {
          if (data?.find((obj) => obj?.userId == users?.id)) {
            users.status = true
            return users
          } else {
            users.status = undefined
            return users
          }
        })
      }

    case "to_top": {
      const user = value?.users?.find?.((obj) => obj?.id == data)

      return {
        ...value,
        users: [user, ...value?.users?.filter((obj) => obj?.id !== data)]
      }
    }

    case "readed":
      const users = value?.users?.map((obj) => {
        if (obj?.id == data) {
          value.total = value.total - obj?.unread

          obj.unread = null
        }

        return obj
      })

      return {
        ...value, users
      }
    case "unread":

      const user = value?.users?.find?.((obj) => obj?.id == data)

      if (user?.unread) {
        user.unread += 1
      } else {
        user.unread = 1
      }

      return {
        ...value,
        total: value?.total ? value?.total + 1 : 1,
        users: [user, ...value?.users?.filter((obj) => obj?.id !== data)]
      }

    case "new_user":
      let total = value?.total;

      if (total && data?.unread) {
        total += 1
      } else if (data?.unread) {
        total = 1
      } else if (total) {
        total = total
      } else {
        total = 0
      }

      if (!value?.users?.find((obj) => obj?.id == data?.user?.id)) {
        return { ...value, total: total, users: [data?.user, ...value?.users] }
      } else if (data?.unread) {
        return {
          total: total, users: value?.users?.map((obj) => {
            if (obj?.id == data?.user?.id) {
              if (obj?.unread) {
                obj.unread += 1
              } else {
                obj.unread = 1
              }
            }

            return obj
          })
        }
      } else {
        return value
      }
    default:
      return value
  }
}

const Users = forwardRef(({ selected, stories, isUsers }, ref) => {
  const { id } = useParams()

  const location = useLocation();

  const navigate = useNavigate();

  const user = useSelector((state) => state?.user)

  const [state, action] = useReducer(reducer, [])

  useImperativeHandle(ref, () => ({
    // optimise and check users listing and add scroll feature

    users_status: (data) => {
      action({ type: "status", data })
    },
    readMsgs: (data) => {
      action({ type: "readed", data: data?.from })
    },
    pushToTop: async (data) => {
      if (!state?.users?.find((obj) => obj?.id == data?.id)) {
        try {
          let res = await axios.get('/chat-single/user_details', {
            params: {
              user: data?.id
            }
          })

          action({
            type: "new_user", data: {
              user: {
                id: res?.['data']?.data?.id,
                status: data?.status,
                details: res?.['data']?.data
              }
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
      if (!state?.users?.find((obj) => obj?.id == data?.from)) {
        try {
          let res = await axios.get('/chat-single/user_details', {
            params: {
              user: data?.from
            }
          })

          action({
            type: "new_user", data: {
              unread: true,
              user: {
                id: res?.['data']?.data?.id,
                unread: 1,
                status: true,
                details: res?.['data']?.data
              }
            }
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
  }, [location])

  return (
    <section id="all-users">
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
            <input type="text" placeholder="Search" />
          </div>
        </Fragment>
      )}

      <div className="list">
        <div
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

        {state?.users?.map((obj, key) => {
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

        <LoadingCircle />
      </div>
    </section>
  );
});

export default Users;
