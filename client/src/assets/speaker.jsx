import React from 'react'

const SpeakerSvg = ({ width, height }) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            className='svg_path_fill'
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M13 3.7446C13 3.27314 12.8728 2.50021 12.1657 2.14424C11.4151 1.76635 10.7163 2.19354 10.3623 2.51158L4.94661 7.43717H3C1.89543 7.43717 1 8.3326 1 9.43717L1.00001 14.6248C1.00001 15.7293 1.89544 16.6248 3.00001 16.6248H4.95001L10.3623 21.4891C10.7175 21.8081 11.416 22.2331 12.1656 21.8554C12.8717 21.4998 13 20.7286 13 20.2561V3.7446Z"
            />
        </svg>
    )
}

export default SpeakerSvg