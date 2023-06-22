import React from "react";

const VideoSvg = ({ width, height, class_name }) => {
  return (
    <svg
      width={width}
      height={height}
      className="svg_path_fill"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <path
        fillRule="evenodd"
        d="M5 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1.586l2.293 2.293A1 1 0 0 0 22 16V8a1 1 0 0 0-1.707-.707L18 9.586V8a3 3 0 0 0-3-3H5z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export default VideoSvg;
