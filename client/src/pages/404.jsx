import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "../redux/additional";
import { useNavigate } from "react-router-dom";

const FourNotFour = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setLoading(false));
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="error_404">
      <h1>404</h1>
      <p>Sorry this page doesn't exist.</p>
      <button
        onClick={() => {
          navigate("/");
        }}
      >
        Home
      </button>
    </div>
  );
};

export default FourNotFour;
