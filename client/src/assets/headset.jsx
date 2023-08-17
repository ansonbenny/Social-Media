import React from 'react'

const HeadsetSvg = ({ width, height, class_name }) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            id="headset"
            data-name="Flat Color"
            xmlns="http://www.w3.org/2000/svg"
            className={`icon flat-color ${class_name}`}
        >
            <path
                id="primary"
                d="M18.86,5A9.38,9.38,0,0,0,2.64,12.05L3,17v1a4,4,0,0,0,4,4H8a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2H7a3.94,3.94,0,0,0-2.36.79A7.37,7.37,0,0,1,12,4a7.37,7.37,0,0,1,7.36,7.79A3.94,3.94,0,0,0,17,11H16a2,2,0,0,0-2,2v7a2,2,0,0,0,2,2h1a4,4,0,0,0,4-4V17l.36-5A9.43,9.43,0,0,0,18.86,5Z"
            />
        </svg>
    )
}

export default HeadsetSvg