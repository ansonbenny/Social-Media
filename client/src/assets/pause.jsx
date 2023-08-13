import React from 'react'

const PauseSvg = ({ width, height }) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            id="pause"
            data-name="Flat Color"
            xmlns="http://www.w3.org/2000/svg"
            className="icon flat-color svg_fill"
        >
            <path
                id="primary"
                d="M19,4V20a2,2,0,0,1-2,2H15a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h2A2,2,0,0,1,19,4ZM9,2H7A2,2,0,0,0,5,4V20a2,2,0,0,0,2,2H9a2,2,0,0,0,2-2V4A2,2,0,0,0,9,2Z"
            />
        </svg>
    )
}

export default PauseSvg