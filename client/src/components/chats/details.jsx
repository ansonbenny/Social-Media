import React from "react";
import {
  AvatarSvg,
  ChatsSvg,
  ParticleSvg,
  PhoneSvg,
  PlusSvg,
  TrashSvg,
  VideoSvg,
  Xsvg,
} from "../../assets";
import "./style.scss";

const ChatDetails = ({ isModal, setModal }) => {
  return (
    <section
      className={`details-chat ${isModal ? "modal-details-chat" : null}`}
    >
      {isModal && (
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
            <img
              src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
              alt="profile"
            />
          </div>
          <h1>Anson Benny</h1>
          <p className="status">online</p>

          <div className="more_actions">
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
            <button>
              <PhoneSvg width={"18px"} height={"18px"} />
            </button>
            <button>
              <VideoSvg width={"20px"} height={"20px"} />
            </button>
            <button>
              <TrashSvg isFull width={"18px"} height={"18px"} />
            </button>
          </div>

          <div className="description">
            <h1>Description</h1>
            <p>
              is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's standard dummy text ever since
              the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </p>
          </div>
        </div>

        <div className="media">
          <h1>
            <ParticleSvg />
            Shared Media
            <span>(300 items)</span>
          </h1>
          <div className="grid">
            <img
              src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
              alt="profile"
            />
            <img
              src="https://img.i-scmp.com/cdn-cgi/image/fit=contain,width=425,format=auto/sites/default/files/styles/768x768/public/d8/images/methode/2021/01/11/d5ed0832-5001-11eb-ad83-255e1243236c_image_hires_113755.jpg?itok=6PsAhoy2&v=1610336282"
              alt="profile"
            />
            <img
              src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
              alt="profile"
            />
            <img
              src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
              alt="profile"
            />
            <img
              src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
              alt="profile"
            />
            <img
              src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
              alt="profile"
            />
          </div>

          <button>View More</button>
        </div>

        <div className="members">
          <div className="top">
            <h1>
              <AvatarSvg width={"20px"} height={"20px"} />
              Members
              <span>(22)</span>
            </h1>
            <button>
              <PlusSvg />
            </button>
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
      </div>
    </section>
  );
};

export default ChatDetails;
