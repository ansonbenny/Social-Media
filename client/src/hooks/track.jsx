import { useEffect, useRef } from 'react'

const useTrack = () => {
    const ref = useRef({});

    useEffect(() => {
        // handeling current time when playing audio files
        const HandleTimeAudio = (e) => {
            if (ref?.current?.["audio_seekbar"]) {
                ref.current["audio_seekbar"].value = e?.target?.currentTime || 0;

                ref.current['audio_seekbar'].classList?.remove("non_active")

                var value =
                    ((ref.current['audio_seekbar'].value - ref.current['audio_seekbar'].min) /
                        (ref.current['audio_seekbar'].max - ref.current['audio_seekbar'].min)) *
                    100;

                ref.current["audio_seekbar"].style.background = `linear-gradient(to right, #6b8afd 0%, #6b8afd ${value}%, #9ca3af ${value}%, #9ca3af 100%)`
            }
        }

        // handeling duration when playing audio files
        const HandleDurationAudio = (e) => {
            if (ref?.current?.["audio_seekbar"]) {
                ref.current["audio_seekbar"].value = 0;

                ref.current["audio_seekbar"].min = 0;

                ref.current["audio_seekbar"].max = e?.target?.duration;
            }
        }

        // handeling audio play
        const HandleAudioPlay = () => {
            ref?.current?.["audio_btn"]?.classList?.add?.('play')
        }

        // handeling audio pause
        const HandleAudioPause = () => {
            ref?.current?.["audio_btn"]?.classList?.remove?.('play')
        }

        ref?.current?.['audio_tag']?.addEventListener?.("timeupdate", HandleTimeAudio)

        ref?.current?.['audio_tag']?.addEventListener?.("durationchange", HandleDurationAudio)

        ref?.current?.['audio_tag']?.addEventListener?.('pause', HandleAudioPause)

        ref?.current?.['audio_tag']?.addEventListener?.('play', HandleAudioPlay)

        return () => {
            ref?.current?.['audio_tag']?.removeEventListener?.("timeupdate", HandleTimeAudio)

            ref?.current?.['audio_tag']?.removeEventListener?.("durationchange", HandleDurationAudio)

            ref?.current?.['audio_tag']?.removeEventListener?.('pause', HandleAudioPause)

            ref?.current?.['audio_tag']?.removeEventListener?.('play', HandleAudioPlay)
        }
    }, [])

    return ref
}

export default useTrack