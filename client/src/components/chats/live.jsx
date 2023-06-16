import React, { useEffect, useRef } from "react";
import { ClipSvg, PhoneSvg, PlusSvg, SendSvg, VideoSvg } from "../../assets";
import "./style.scss";

const ChatLive = () => {
  return (
    <section className="live">
      <div className="head">
        <div className="cover">
          <img
            src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
            alt="profile"
          />
        </div>
        <div className="details">
          <h1>Anson Benny</h1>
          <p>Online</p>
        </div>
        <div className="actions">
          {
            // for groups
            <button>
              <PlusSvg
                class_name={"svg_path_fill"}
                width={"19px"}
                height={"19px"}
              />
            </button>
          }
          <button>
            <PhoneSvg
              class_name={"svg_path_fill"}
              width={"18px"}
              height={"18px"}
            />
          </button>
          <button>
            <VideoSvg
              class_name={"svg_path_fill"}
              width={"25px"}
              height={"25px"}
            />
          </button>
        </div>
      </div>

      <div className="body">
        <div className="messages">
          <div className="others">
            <div className="cover">
              <img
                src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
                alt="profile"
              />
            </div>
            <div className="card">
              <div className="from">
                <p className="author">Anson</p>
                <p className="time">09/03/2023 08:30</p>
              </div>

              <div className="msg">Hello Ajith.</div>
            </div>
          </div>

          <div className="me">
            <div className="card">
              <div className="from">
                <p className="author">Ajith</p>
                <p className="time">08:30</p>
              </div>

              <div className="msg">Hello How Are You</div>
            </div>

            <div className="cover">
              <img
                src="https://yt3.googleusercontent.com/ytc/AGIKgqPh9kVptaKpovayOfZGjfyZV7DExqpIUitIiTlKuQ=s900-c-k-c0x00ffffff-no-rj"
                alt="profile"
              />
            </div>
          </div>

          <div className="others">
            <div className="cover">
              <img
                src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
                alt="profile"
              />
            </div>
            <div className="card">
              <div className="from">
                <p className="author">Anson</p>
                <p className="time">08:30</p>
              </div>

              <div className="msg">Iam Fine, How is today going</div>
            </div>
          </div>

          <div className="me">
            <div className="card">
              <div className="from">
                <p className="author">Ajith</p>
                <p className="time">08:30</p>
              </div>

              <div className="msg">Today is good not bad.</div>
            </div>

            <div className="cover">
              <img
                src="https://yt3.googleusercontent.com/ytc/AGIKgqPh9kVptaKpovayOfZGjfyZV7DExqpIUitIiTlKuQ=s900-c-k-c0x00ffffff-no-rj"
                alt="profile"
              />
            </div>
          </div>

          <div className="others">
            <div className="cover">
              <img
                src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
                alt="profile"
              />
            </div>
            <div className="card">
              <div className="from">
                <p className="author">Anson</p>
                <p className="time">08:35</p>
              </div>

              <div className="msg">
                How is my articles, Lorem Ipsum is simply dummy text of the
                printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s, when an
                unknown printer took a galley of type and scrambled it to make a
                type specimen book. It has survived not only five centuries, but
                also the leap into electronic typesetting, remaining essentially
                unchanged. It was popularised in the 1960s with the release of
                Letraset sheets containing Lorem Ipsum passages, and more
                recently with desktop publishing software like Aldus PageMaker
                including versions of Lorem Ipsum
              </div>
            </div>
          </div>
          <div className="others">
            <div className="cover">
              <img
                src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
                alt="profile"
              />
            </div>
            <div className="card">
              <div className="from">
                <p className="author">Anson</p>
                <p className="time">08:35</p>
              </div>

              <div className="msg">
                <img src="https://images.mktw.net/im-764473?width=1280&size=1"/>
              </div>
            </div>
          </div>
        </div>
        <div className="textarea">
          <div className="border">
            <button>
              <ClipSvg width={"18px"} height={"18px"} class_name={"svg_fill"} />
            </button>
            <input placeholder="Write a message..." />
            <button>
              <SendSvg
                width={"18px"}
                height={"18px"}
                class_name={"svg_path_stroke"}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatLive;
