import React from "react";
import { PlaySvg, PlusSvg } from "../../assets";
import "./style.scss";

const StoriesUser = () => {
  return (
    <div className="stories-user">
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
      <div className="items">
        <div className="card-add">
          <button>
            <PlusSvg />
          </button>
          <p>
            Create
            <br />
            Your Story
          </p>
        </div>

        <div className="card">
          <img
            className="thumb"
            src="https://nextluxury.com/wp-content/uploads/Bedroom-Computer-Room-Ideas-8-rombeethuwon.jpg"
          />
          <div className="user">
            <img
              className="cover-user"
              src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
              alt=""
            />
            <h1 className="user-name">Anson Benny</h1>
          </div>

          <div className="play">
            <button>
              <PlaySvg width={"25px"} height={"25px"} />
            </button>
          </div>
        </div>

        <div className="card">
          <img
            className="thumb"
            src="https://www.kicksonfire.com/wp-content/uploads/2018/10/Nike-Cortez-Kenny-4-House-Shoe.jpg?x58464"
          />

          <div className="user">
            <img
              className="cover-user"
              src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
              alt=""
            />
            <h1 className="user-name">Anson Benny</h1>
          </div>

          <div className="play">
            <button>
              <PlaySvg width={"25px"} height={"25px"} />
            </button>
          </div>
        </div>

        <div className="card">
          <img
            className="thumb"
            src="https://welpmagazine.com/wp-content/uploads/2019/07/olena-sergienko-dIMJWLx1YbE-unsplash-758x1011.jpg"
          />

          <div className="user">
            <img
              className="cover-user"
              src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
              alt=""
            />
            <h1 className="user-name">Anson Benny</h1>
          </div>

          <div className="play">
            <button>
              <PlaySvg width={"25px"} height={"25px"} />
            </button>
          </div>
        </div>

        <div className="card">
          <img
            className="thumb"
            src="https://nextluxury.com/wp-content/uploads/Bedroom-Computer-Room-Ideas-7-rombeethuwon.jpg"
          />

          <div className="user">
            <img
              className="cover-user"
              src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
              alt=""
            />
            <h1 className="user-name">Anson Benny</h1>
          </div>

          <div className="play">
            <button>
              <PlaySvg width={"25px"} height={"25px"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoriesUser;
