import React from 'react'

const EndSvg = ({ width, height }) => {
    return (
        <svg
            width={width}
            height={height}
            className='svg_fill'
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M22 12.3848C22 11.8213 21.7668 11.2775 21.3263 10.9261C16.0181 6.69129 7.98187 6.6913 2.67372 10.9261C2.23323 11.2775 2 11.8213 2 12.3848V14.0459C2 15.4609 3.42906 16.4284 4.74279 15.9029L5.75503 15.498C6.50695 15.1972 7 14.469 7 13.6591V13.6591C7 12.9634 7.36003 12.302 8.01151 12.058C10.3085 11.1977 13.6915 11.1977 15.9885 12.058C16.64 12.302 17 12.9634 17 13.6591V13.6591C17 14.469 17.493 15.1972 18.245 15.498L19.2572 15.9029C20.5709 16.4284 22 15.4609 22 14.0459V12.3848Z"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default EndSvg