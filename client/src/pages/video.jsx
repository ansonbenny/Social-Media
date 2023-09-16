import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../redux/additional';
import { CallActions } from '../components';

const VideoCall = () => {
    const dispatch = useDispatch()

    const user = useSelector((state) => state?.user)

    useEffect(() => {
        document.title = "Soft Chat - Video Call";

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
    return (
        <section className="video_call">
            <video className='to_video' src="/samples/one_v.mp4" autoPlay muted controls={false}></video>

            <video className="from_video" src="/samples/two_v.mp4" autoPlay muted controls={false}></video>

            <CallActions />

        </section>
    )
}

export default VideoCall