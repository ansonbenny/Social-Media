import React from "react";

const SmileySvg = ({ width, height }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className="svg_fill"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x={0} fill="none" width={24} height={24} />
      <g>
        <path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM7.55 13c-.02.166-.05.33-.05.5 0 2.485 2.015 4.5 4.5 4.5s4.5-2.015 4.5-4.5c0-.17-.032-.334-.05-.5h-8.9zM10 10V8c0-.552-.448-1-1-1s-1 .448-1 1v2c0 .552.448 1 1 1s1-.448 1-1zm6 0V8c0-.552-.448-1-1-1s-1 .448-1 1v2c0 .552.448 1 1 1s1-.448 1-1z" />
      </g>
    </svg>
  );
};

export default SmileySvg;
