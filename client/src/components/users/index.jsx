import React, { Fragment } from "react";
import { SearchSvg } from "../../assets";
import { useNavigate } from "react-router-dom";
import { LoadingCircle } from "..";
import "./style.scss";

const Users = ({ selected, stories }) => {
  const navigate = useNavigate();

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
              Messages <span>(29)</span>
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
          className="card active"
          onClick={() => navigate("/chat/64a13272e41b711841b83928")}
        >
          <div className="cover">
            <img
              src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
              alt="profile"
            />
          </div>
          <div className="content">
            <h1>Anson Benny</h1>
            <p>
              is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's
            </p>
          </div>
        </div>

        <div
          className="card"
          onClick={() => {
            navigate("/chat/64ac033a1668d20be2008f80");
          }}
        >
          <div className="cover">
            <img
              src="https://img.i-scmp.com/cdn-cgi/image/fit=contain,width=425,format=auto/sites/default/files/styles/768x768/public/d8/images/methode/2021/01/11/d5ed0832-5001-11eb-ad83-255e1243236c_image_hires_113755.jpg?itok=6PsAhoy2&v=1610336282"
              alt="profile"
            />
          </div>
          <div className="content">
            <h1>Sidharth Vijayan</h1>
            <p>
              is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's
            </p>
          </div>
          {!stories && (
            <button className="count" type="button">
              12
            </button>
          )}
        </div>

        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]?.map((obj, key) => {
          return (
            <div className="card" key={key}>
              <div className="cover">
                <img
                  src="https://yt3.googleusercontent.com/ytc/AGIKgqPh9kVptaKpovayOfZGjfyZV7DExqpIUitIiTlKuQ=s900-c-k-c0x00ffffff-no-rj"
                  alt="profile"
                />
              </div>
              <div className="content">
                <h1>Ajith George {obj}</h1>
                <p>
                  is simply dummy text of the printing and typesetting industry.
                  Lorem Ipsum has been the industry's
                </p>
              </div>
            </div>
          );
        })}

        <LoadingCircle />
      </div>
    </section>
  );
};

export default Users;