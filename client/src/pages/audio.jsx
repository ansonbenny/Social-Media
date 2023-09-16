import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../redux/additional';
import { CallActions, CallRinging } from '../components';

const AudioCall = () => {
    const dispatch = useDispatch()

    const user = useSelector((state) => state?.user)

    useEffect(() => {
        document.title = "Soft Chat - Audio Call";

        let timer;

        if (user) {
            timer = setTimeout(() => {
                dispatch(setLoading(false));
            }, 1000);
        } else {
            dispatch(setLoading(true));
        }

        return () => {
            clearTimeout(timer);
        };
    }, [])
    return (false ? <section className="audio_call">
        <div className="users">
            <div className="from">
                A
            </div>

            <div className="to">
                B
            </div>
        </div>
        <audio src='https://www.learningcontainer.com/download/sample-mp3-file/?wpdmdl=1676&refresh=64e81122764691692930338' className='from_audio' />

        <CallActions isAudio />

    </section>
        : <CallRinging />
    )
}

export default AudioCall