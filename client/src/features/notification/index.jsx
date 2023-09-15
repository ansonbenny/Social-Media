import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Xsvg } from "../../assets";
import { setNotification } from "../../redux/additional";
import "./style.scss";

const Notification = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const notification = useSelector((state) => state?.additional?.notification);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setNotification());
    }, 10000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return notification && <section className="notification-modal">
    <div className="inner">
      <div className="head">
        <h1>Notification</h1>
        <button
          onClick={() => {
            dispatch(setNotification());
          }}
        >
          <Xsvg />
        </button>
      </div>

      <p>You Received New Message From {notification?.name}</p>

      <div>
        <button
          onClick={() => {
            dispatch(setNotification());
            navigate(notification?.url || "");
          }}
        >
          Check
        </button>
      </div>
    </div>
  </section>
};

export default Notification;
