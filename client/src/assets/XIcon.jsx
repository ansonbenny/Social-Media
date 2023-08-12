import React from "react";

const Xsvg = ({ width, height, class_name }) => {
  return (
    <svg
      width={width}
      height={height}
      className={class_name}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <path d="M12.78 4.28a.75.75 0 00-1.06-1.06L8 6.94 4.28 3.22a.75.75 0 00-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 101.06 1.06L8 9.06l3.72 3.72a.75.75 0 101.06-1.06L9.06 8l3.72-3.72z" />
    </svg>
  );
};

export default Xsvg;
