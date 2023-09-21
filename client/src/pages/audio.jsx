import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../redux/additional';
import { CallActions, CallRinging } from '../components';
import { useSocket } from '../hooks';

const AudioCall = () => {
    const dispatch = useDispatch()

    const Socket = useSocket(true);

    const { user, call } = useSelector((state) => state)

    // when change route or exit site end call & already in a call wont call

    const emitUser = useCallback(() => {
        Socket?.emit("user", user?._id);
    }, [Socket]);

    useEffect(() => {
        document.title = "Soft Chat - Audio Call";

        let timer;

        if (user && call) {
            emitUser?.();

            timer = setTimeout(() => {
                dispatch(setLoading(false));
            }, 1000);
        } else {
            dispatch(setLoading(true));
        }

        return () => {
            clearTimeout(timer);
        };
    }, [call, emitUser]);

    return (call?.attend ? <section className="audio_call">
        <div className="users">
            <div className="from">
                {
                    call?.from_name?.[0]
                }
            </div>

            <div className="to">
                {
                    call?.toName?.[0]
                }
            </div>
        </div>
        <div className='in'>
            <p>In Call With</p>
            <h1>{
                call?.from == user?._id ? call?.toName : call?.from_name
            }</h1>
        </div>
        <audio src='https://www.learningcontainer.com/download/sample-mp3-file/?wpdmdl=1676&refresh=64e81122764691692930338' className='from_audio' />

        <CallActions isAudio />

    </section>
        : <CallRinging />
    )
}

export default AudioCall