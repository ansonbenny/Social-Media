import React, { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../redux/additional';
import { CallActions, CallRinging } from '../components';
import { useSocket } from '../hooks';
import Peer from 'peerjs';
import { addEnded } from '../redux/call';

const AudioCall = () => {
    const myPeer = new Peer();

    const ref = useRef({});

    const dispatch = useDispatch()

    const Socket = useSocket(true);

    const user = useSelector((state) => state?.user)

    const call = useSelector((state) => state?.call)

    const Mute = (e) => {
        if (e?.target?.classList?.contains("active")) {
            e?.target?.classList?.remove("active");

            ref.current.call.muted = false
        } else {
            e?.target?.classList?.add("active");

            ref.current.call.muted = true
        }
    }

    const setPeerData = (active_peer, peerId, stream) => {
        // for saving & update peer data

        ref.current = {
            ...ref.current,
            peer: {
                active_peer: active_peer ? active_peer : ref?.current?.peer?.active_peer,
                peerId: peerId ? peerId : ref?.current?.peer?.peerId
            },
            stream: stream ? stream : ref?.current?.stream
        }
    }

    const CloseStream = () => {
        if (ref?.current?.stream) {
            ref?.current?.stream?.getTracks()?.forEach((track) => track.stop?.());
            ref?.current?.stream?.release?.();
        }
    }

    const On_WebRTC_Change = (stream) => {
        const call_peer = myPeer.call(ref?.current?.peer?.peerId, stream)

        setPeerData(call_peer)

        call_peer?.on?.('close', () => {
            // when user left call end
            dispatch(addEnded());
        })
    }

    const On_Media_Change = (audio = false) => {
        navigator?.mediaDevices?.getUserMedia({
            video: false,
            audio: true
        }).then((stream) => {
            CloseStream?.();

            setPeerData(null, null, stream);

            for (let audioTrack of stream.getAudioTracks()) {
                audioTrack.enabled = audio === 'true' ? true : false;
            }

            On_WebRTC_Change(stream)
        }).catch((err) => {
            console.info(err)
        })
    }

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

            if (call?.attend) {
                Socket.on("user joined call", (id) => {
                    setPeerData(null, id)
                })

                // webrtc
                navigator?.mediaDevices?.getUserMedia({
                    video: false,
                    audio: true
                }).then((stream) => {
                    CloseStream?.();

                    setPeerData(null, null, stream);

                    myPeer.on('call', (call_peer) => { // When we join someone's room we will receive a call from them

                        setPeerData(call_peer)

                        call_peer.answer(stream); // Stream them our video/audio

                        call_peer.on("stream", (userVideoStream) => { // when we recieve their stream
                            ref.current.call.srcObject = userVideoStream;
                        })

                        call_peer.on('close', () => {
                            // when user left call end
                            dispatch(addEnded());
                        })
                    })

                    const CallPeer = (id) => {
                        const call_peer = myPeer.call(id, stream) // Call the user who just joined

                        setPeerData(call_peer)

                        call_peer.on('stream', (userVideoStream) => {
                            ref.current.call.srcObject = userVideoStream;
                        })

                        call_peer.on('close', () => {
                            // when user left call end
                            dispatch(addEnded());
                        })
                    }

                    if (ref?.current?.peer?.peerId) {
                        CallPeer(ref?.current?.peer?.peerId)
                    } else {
                        Socket.on("user joined call", (id) => {
                            setPeerData(null, id)
                            CallPeer(id)
                        })
                    }
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

                // when device change
                navigator?.mediaDevices?.addEventListener('devicechange', () => On_Media_Change('true'))
            }
        } else {
            dispatch(setLoading(true));
        }

        // event listeners
        const onMetaData = (e) => {
            e?.target?.play()
        }

        ref?.current?.call?.addEventListener('loadedmetadata', onMetaData)

        return () => {
            clearTimeout(timer);

            myPeer.off("open");

            myPeer.off("call");

            myPeer.off("stream");

            ref?.current?.peer?.active_peer?.close?.() // closing active connections when user left

            myPeer?.disconnect?.();

            CloseStream?.();

            Socket?.off("user joined call");

            ref?.current?.call?.removeEventListener('loadedmetadata', onMetaData);

            if (call?.attend) {
                // when device change
                navigator?.mediaDevices?.removeEventListener('devicechange', () => On_Media_Change('true'))
            }
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
        <audio className='from_audio' ref={(elm) => {
            if (ref?.current) {
                ref.current.call = elm
            }
        }} />

        <CallActions isAudio Mute={Mute} On_Media_Change={On_Media_Change} />

    </section>
        : <CallRinging />
    )
}

export default AudioCall