import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "../redux/additional";
import { useNavigate } from "react-router-dom";

const FourNotFour = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Soft Chat - Error"

    const timer = setTimeout(() => {
      dispatch(setLoading(false));
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <section data-for="error_404">
      {
        /close_tab/i.test(window.location.pathname)
          ? <h1>409</h1>
          : <h1>404</h1>
      }
      {
        /close_tab/i.test(window.location.pathname)
          ? <p>Site Opened In Another Device or Browser Tab.</p>
          : <p>Sorry this page doesn't exist.</p>
      }
      <button
        onClick={() => {
          navigate("/");
        }}
      >
        {
          /close_tab/i.test(window.location.pathname)
            ? "Stay" : "Home"
        }
      </button>
    </section>
  );
};

export default FourNotFour;
