import React, { useEffect, useState } from 'react'
import './style.scss'

const Offline = () => {
    const [offline, setOffline] = useState(!navigator?.onLine);

    useEffect(() => {
        // for check network connection

        window.addEventListener("offline", () => {
            setOffline(true)
        })

        window.addEventListener('online', () => {
            window.location.reload(false);
        })

        return () => {
            window.removeEventListener("offline", () => {
                setOffline(true)
            })

            window.removeEventListener('online', () => {
                window.location.reload(false);
            })
        }
    }, [])

    return offline && (<section data-for="offline">
        <h1>! You are in offline. Please Check Internet Connection.</h1>
        <button onClick={() => {
            window.location.reload(false)
        }}>
            Reload
        </button>
    </section>)
}

export default Offline