import React, { useRef } from "react";
import { PlaySvg, PlusSvg, TrashSvg } from "../../assets";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Modal } from "../";
import "./style.scss";

const StoriesUser = () => {

  const { id } = useParams();

  const ref = useRef();

  const user = useSelector((state) => state?.user);

  return (
    <section className="stories-user">
      <Modal isStories ref={ref} />

      <div className="items">
        {
          id == user?._id && <div className="card-add">
            <button
              className="chats_modal_special"
              onClick={() => {
                ref?.current?.Modal?.(true)
              }}>
              <PlusSvg />
            </button>
            <p>
              Create
              <br />
              Your Story
            </p>
          </div>
        }

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

          <div className="actions">
            <button>
              <PlaySvg width={"25px"} height={"25px"} />
            </button>

            {
              id == user?._id && <button className="trash">
                <TrashSvg width={'16px'} height={'16px'} />
              </button>
            }
          </div>

        </div>
      </div>
    </section>
  );
};

export default StoriesUser;
