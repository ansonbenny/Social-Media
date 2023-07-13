import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "../redux/additional";

const FourNotFour = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      dispatch(setLoading(false));
    }, 1000);
  }, []);
  return (
    <div className="error_404">
      <h1>404</h1>
      <p>Sorry this page doesn't exist.</p>
    </div>
  );
};

export default FourNotFour;
