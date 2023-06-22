import React from "react";

const ChatsSvg = ({ width, height }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      id="chat"
      data-name="Line Color"
      xmlns="http://www.w3.org/2000/svg"
      className="icon line-color path_svg_stroke"
    >
      <path
        id="primary"
        d="M18.81,16.23,20,21l-4.95-2.48A9.84,9.84,0,0,1,12,19c-5,0-9-3.58-9-8s4-8,9-8,9,3.58,9,8A7.49,7.49,0,0,1,18.81,16.23Z"
        style={{
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
        }}
      />
    </svg>
  );
};

export default ChatsSvg;
