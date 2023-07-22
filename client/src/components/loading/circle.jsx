import React, { forwardRef } from "react";
import "./style.scss";

const LoadingCircle = forwardRef(({}, ref) => {
  return (
    <div
      id="loading_circle"
      className="hide"
      ref={(elm) => {
        if (ref?.current) {
          ref.current.loading = elm;
        }
      }}
    >
      <div className="circle" />
    </div>
  );
});

export default LoadingCircle;
