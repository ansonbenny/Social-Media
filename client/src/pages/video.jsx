import React, { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../redux/additional';
import { CallActions, CallRinging } from '../components';
import { useSocket } from '../hooks';
import Peer from 'peerjs'
import { addEnded } from '../redux/call';

const VideoCall = () => {

    // for p2p
    const myPeer = new Peer();

    const ref = useRef({
        controls: {
            video: true,
            audio: true
        }
    });

    const dispatch = useDispatch();

    const Socket = useSocket(true);

    const user = useSelector((state) => state?.user)

    const call = useSelector((state) => state?.call)

    const Mute = (e) => {
        if (e?.target?.classList?.contains("active")) {
            e?.target?.classList?.remove("active");

            ref.current.big.muted = false
        } else {
            e?.target?.classList?.add("active");

            ref.current.big.muted = true
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
        if (ref?.current?.small) {
            ref.current.small.srcObject = stream;
        }

        const call_peer = myPeer.call(ref?.current?.peer?.peerId, stream)

        setPeerData(call_peer)

        call_peer?.on?.('close', () => {
            // when user left call end
            dispatch(addEnded());
        })
    }

    const On_Media_Change = (audio = false, video = false) => {
        if (video) {
            ref.current.controls.video = video === 'true' ? true : false
        } else if (audio) {
            ref.current.controls.audio = audio === 'true' ? true : false
        }

        navigator?.mediaDevices?.getUserMedia({
            video: true,
            audio: ref?.current?.controls?.audio
        }).then((stream) => {

            CloseStream?.();

            setPeerData(null, null, stream);

            for (let videoTrack of stream.getVideoTracks()) {
                videoTrack.enabled = ref?.current?.controls?.video
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
        document.title = "Soft Chat - Video Call";

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
                    video: true,
                    audio: true
                }).then((stream) => {
                    CloseStream?.()

                    setPeerData(null, null, stream);

                    if (ref?.current?.small) {
                        ref.current.small.srcObject = stream;
                    }

                    myPeer.on('call', (call_peer) => { // When we join someone's room we will receive a call from them

                        setPeerData(call_peer)

                        call_peer.answer(stream); // Stream them our video/audio

                        call_peer.on("stream", (userVideoStream) => { // when we recieve their stream
                            ref.current.big.srcObject = userVideoStream;
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
                            ref.current.big.srcObject = userVideoStream;
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
                navigator?.mediaDevices?.addEventListener('devicechange', () => On_Media_Change())
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

            ref?.current?.peer?.active_peer?.close?.() // closing active connections when user left

            myPeer?.disconnect?.();

            CloseStream?.();

            Socket?.off("user joined call");

            ref?.current?.small?.removeEventListener('loadedmetadata', onMetaData);

            ref?.current?.big?.removeEventListener('loadedmetadata', onMetaData);

            if (call?.attend) {
                // when device change
                navigator?.mediaDevices?.removeEventListener('devicechange', () => On_Media_Change())
            }
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

            <CallActions Mute={Mute} On_Media_Change={On_Media_Change} />

        </section>
            : <CallRinging />
    )
}

export default VideoCall