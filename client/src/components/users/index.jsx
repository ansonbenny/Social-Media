import React, { Fragment, useEffect, useState } from "react";
import { AvatarSvg, SearchSvg } from "../../assets";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingCircle } from "..";
import { axios } from "../../lib";
import "./style.scss";
import { useSelector } from "react-redux";

const Users = ({ selected, stories, isUsers }) => {
  const navigate = useNavigate();

  const user = useSelector((state) => state?.user)

  const { id } = useParams()

  const [state, setState] = useState([])

  //add green color circle in image to show user is online

  useEffect(() => {
    let abortControl = new AbortController();

    if (isUsers) {
      (async () => {
        try {
          let res = await axios.get("/chat/users_chat", {
            signal: abortControl?.signal
          })

          setState(res?.['data']?.data)
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
  }, [])

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
              Messages <span>(0)</span>
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

          {!stories && false && (
            <button className="count" type="button">
              12
            </button>
          )}

        </div>

        {state?.map((obj, key) => {
          if (obj?._id !== user?._id) {
            return (
              <div className={`card ${id && id == obj?._id ? "active" : ""}`} key={key}
                onClick={() => navigate(`/chat/${obj?._id}`)}>
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
                  <p>
                    {obj?.about}
                  </p>
                </div>
              </div>
            );
          }
        })}

        <LoadingCircle />
      </div>
    </section>
  );
};

export default Users;
