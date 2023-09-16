import React from 'react'
import './style.scss'

const CallRinging = () => {
    return (
        <section className='call-ringing'>
            <div className="user">
                A
            </div>
            <h1>Anson Benny</h1>
            <p className='status'>Calling</p>

            <div className="actions">
                <button className='accept'>Accept</button>
                <button className='end'>End</button>
            </div>
        </section>
    )
}

export default CallRinging