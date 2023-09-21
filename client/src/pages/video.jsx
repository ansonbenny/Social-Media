import React, { useCallback, useEffect, useReducer, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../redux/additional';
import { CallActions, CallRinging } from '../components';
import { useSocket } from '../hooks';
import { Peer } from 'peerjs'
import { addEnded } from '../redux/call';

const reducer = (state, { type, data, ...action }) => {
    switch (type) {
        default:
            return state
    }
}

const VideoCall = () => {
    const ref = useRef({});

    const dispatch = useDispatch();

    const Socket = useSocket(true);

    const user = useSelector((state) => state?.user)

    const call = useSelector((state) => state?.call)

    //const [state, actions] = useReducer(reducer, {})

    const emitUser = useCallback(() => {
        Socket?.emit("user", user?._id);
    }, [Socket]);

    useEffect(() => {
        document.title = "Soft Chat - Video Call";

        // for p2p
        const myPeer = new Peer();

        let peers = [] // for close all active connections

        let timer;

        if (user && call) {
            emitUser?.();

            timer = setTimeout(() => {
                dispatch(setLoading(false));
            }, 1000);

            if (call?.attend) {
                // webrtc
                navigator?.mediaDevices?.getUserMedia({
                    video: true,
                    audio: true
                }).then((stream) => {
                    if (ref?.current?.small) {
                        ref.current.small.srcObject = stream;
                    }

                    myPeer.on('call', (call_peer) => { // When we join someone's room we will receive a call from them

                        peers?.push(call_peer)

                        call_peer.answer(stream); // Stream them our video/audio

                        call_peer.on("stream", (userVideoStream) => { // when we recieve their stream
                            ref.current.big.srcObject = userVideoStream;
                        })

                        call_peer.on('close', () => {
                            // when user left call end
                            dispatch(addEnded());
                        })
                    })

                    Socket.on("user joined video", (id) => { // This runs when someone joins our room
                        let call_peer = myPeer.call(id, stream) // Call the user who just joined

                        peers?.push(call_peer)

                        call_peer.on('stream', (userVideoStream) => {
                            ref.current.big.srcObject = userVideoStream;
                        })

                        call_peer.on('close', () => {
                            // when user left call end
                            dispatch(addEnded());
                        })
                    })
                }).catch((err) => {
                    alert(err)
                })

                myPeer.on("open", (id) => {
                    Socket.emit("join video call", {
                        id,
                        to: call?.from == user?._id ? call?.to : call?.from,
                        myId: user?._id
                    })
                })

                navigator.mediaDevices.ondevicechange = (event) => {
                    console.log(event)
                }
            }
        } else {
            dispatch(setLoading(true));
        }

        // event listeners
        const onMetaData = (e) => {
            e?.target?.play()
        }

        ref?.current?.small?.addEventListener('loadedmetadata', onMetaData)

        ref?.current?.big?.addEventListener('loadedmetadata', onMetaData)

        return () => {
            clearTimeout(timer);

            myPeer.off("open");

            myPeer.off("call");

            myPeer.off("stream");

            peers?.forEach?.((peer) => {
                // closing active connections when user left
                peer?.close?.()
            })

            myPeer?.disconnect?.();

            Socket?.off("user joined video");

            ref?.current?.small?.removeEventListener('loadedmetadata', onMetaData);

            ref?.current?.big?.removeEventListener('loadedmetadata', onMetaData);
        };
    }, [call, emitUser])

    return (
        call?.attend ? <section className="video_call">
            <video
                className='to_video'
                controls={false}
                ref={(elm) => {
                    if (ref?.current) {
                        ref.current.big = elm
                    }
                }}
            />

            <video
                className="from_video"
                muted
                controls={false}
                ref={(elm) => {
                    if (ref?.current) {
                        ref.current.small = elm
                    }
                }}
            />

            <CallActions />

        </section>
            : <CallRinging />
    )
}

export default VideoCall