import React, { Fragment } from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { axios } from '../../lib';
import { addCall } from '../../redux/call';
import { EndSvg, MicSvg, SpeakerSvg, VideoSvg } from '../../assets'
import './style.scss'

const CallActions = ({ isAudio }) => {
    const navigate = useNavigate();

    const dispatch = useDispatch()

    const user = useSelector((state) => state?.user)

    const call = useSelector((state) => state?.call)

    const EndCall = async () => {
        try {
            await axios.delete('/call/cancel', {
                data: {
                    to: call?.from == user?._id ? call?.to : call?.from
                }
            })

            dispatch(addCall(null))

            navigate('/')

        } catch (err) {
            if (err?.response?.data?.status == 405) {
                alert("Please Login")

                navigate('/login')
            } else if (err?.code !== "ERR_CANCELED") {
                alert(err?.response?.data?.message || "Something Went Wrong");
            }
        }
    }

    return (
        <Fragment>
            {
                !isAudio && <button className="mute_call_actions more_actions">
                    <SpeakerSvg />
                </button>
            }

            <div className='CallActions'>
                {
                    isAudio && <button className="more_actions">
                        <SpeakerSvg />
                    </button>
                }

                {
                    !isAudio && <button className='more_actions'>
                        <VideoSvg />
                    </button>
                }

                <button className='end' onClick={EndCall}>
                    <EndSvg />
                </button>

                <button className='more_actions'>
                    <MicSvg />
                </button>
            </div>
        </Fragment>
    )
}

export default CallActions