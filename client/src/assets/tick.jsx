import React from 'react'

const TickSvg = ({ width, height }) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            className='svg_stroke'
        >
            <polyline points="2.75 8.75,6.25 12.25,13.25 4.75" />
        </svg>
    )
}

export default TickSvg