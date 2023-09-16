import React, { Fragment } from 'react'
import { MicSvg, SpeakerSvg, VideoSvg } from '../../assets'
import './style.scss'

const CallActions = ({ isAudio }) => {
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

                <button className='end'>End Call</button>

                <button className='more_actions'>
                    <MicSvg />
                </button>
            </div>
        </Fragment>
    )
}

export default CallActions