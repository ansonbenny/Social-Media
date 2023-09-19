import React from 'react'
import { ringing } from '../../assets'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { axios } from '../../lib'
import './style.scss'

const CallRinging = () => {
    const navigate = useNavigate();

    const user = useSelector((state) => state?.user)

    const call = useSelector((state) => state?.call)

    const Action = async (isAttend) => {
        try {
            if (isAttend) {
                await axios.post('/call/attend', {
                    to: call?.from == user?._id ? call?.to : call?.from
                })
            } else {
                await axios.delete('/call/cancel', {
                    data: {
                        to: call?.from == user?._id ? call?.to : call?.from
                    }
                })

                navigate('/')
            }
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
        <section className='call-ringing'>
            <div className="user">
                {
                    call?.from == user?._id ? call?.toName?.[0] : call?.from_name?.[0]
                }
            </div>
            <h1>
                {
                    call?.from == user?._id ? call?.toName : call?.from_name
                }
            </h1>
            <p className={`status ${call?.ended ? 'ended' : ""}`}>
                {
                    call?.ended ? "CALL ENDED" : call?.from == user?._id ? "Calling" : "Incoming"
                }
            </p>

            {
                !call?.ended && <>
                    <div className="actions">
                        {
                            call?.from !== user?._id && <button className='accept' onClick={() => Action(true)}>Accept</button>
                        }
                        <button className='end' onClick={() => Action()}>End</button>
                    </div>

                    <audio loop controls autoPlay>
                        <source src={ringing} type="audio/mpeg" />
                    </audio>
                </>
            }
        </section>
    )
}

export default CallRinging