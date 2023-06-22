import React from "react";

const PlusSvg = ({ width, height }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 36 36"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      aria-hidden="true"
      role="img"
      className={`iconify iconify--twemoji svg_path_fill`}
      preserveAspectRatio="xMidYMid meet"
    >
      <path d="M31 15H21V5a3 3 0 1 0-6 0v10H5a3 3 0 1 0 0 6h10v10a3 3 0 1 0 6 0V21h10a3 3 0 1 0 0-6z" />
    </svg>
  );
};

export default PlusSvg;
