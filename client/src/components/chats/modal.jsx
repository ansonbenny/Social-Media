import React, { forwardRef, useEffect, useImperativeHandle, useReducer, useRef } from 'react'
import { ClipSvg, PauseSvg, PlaySvg, SendSvg, Xsvg } from '../../assets'
import { useAudio } from '../../hooks'
import { useParams } from 'react-router-dom'

const reducer = (value, { type, ...actions }) => {
    switch (type) {
        case 'open':
            return { ...value, active: true, form: actions?.form || undefined }
        case 'close':
            return { ...value, active: undefined }
        case "file":
            if (/video/i.test(actions?.file?.type)) {
                delete value?.audio
                delete value?.image

                return { ...value, video: actions?.file }
            } else if (/audio/i.test(actions?.file?.type)) {
                delete value?.video
                delete value?.image

                return { ...value, audio: actions?.file }
            } else if (/image/i.test(actions?.file?.type)) {
                delete value?.audio
                delete value?.video

                return { ...value, image: actions?.file }
            } else {
                return { ...value }
            }
        case "clear-file":
            delete value?.audio
            delete value?.video
            delete value?.image

            return { ...value }
        default:
            return value
    }
}

const Modal = forwardRef(({ audio_live, isUser, setChat }, ref) => {

    const refs = useAudio()

    const { id } = useParams()

    const [state, action] = useReducer(reducer, {})

    const CloseModal = () => {
        action({ type: "close" })

        if (refs?.current?.['audio_seekbar']?.classList?.contains('modal_audio_seekBar')) {
            refs?.current?.['audio_tag']?.pause?.()
        }
    }

    const FormHanlde = (e) => {
        e?.preventDefault?.()

        if (isUser) {

        }
    }

    useEffect(() => {
        const ModalControl = (e) => {
            if (
                !refs?.current?.inner_modal?.contains(e?.target) &&
                !e?.target?.classList?.contains("file_for_modal") &&
                !e?.target?.classList?.contains('file_upload')
            ) {
                CloseModal?.()
            }

        }

        window.addEventListener('click', ModalControl)

        return () => {
            window.removeEventListener('click', ModalControl)
        }
    }, [])

    useImperativeHandle(ref, () => ({
        Modal: (data) => {
            action({ type: "open", form: data })
        }
    }))

    return (
        <section data-for="modal_outer" className={state?.active ? "active" : "none"} >
            <div className="inner_modal" ref={(elm) => {
                if (refs?.current) {
                    refs.current.inner_modal = elm
                }
            }}>
                {
                    state?.image && <div className="scroll_bar" >
                        <img src={state?.image?.url} onClick={(e) => {
                            e?.target?.classList?.toggle?.('zoom')
                        }} />
                    </div>
                }

                {
                    state?.video && <video controls src={state?.video?.url} />
                }

                {
                    state?.audio &&
                    <div className="audio">
                        <button
                            className="modal_audio_btn"
                            onClick={(e) => {
                                audio_live?.pause?.()

                                refs?.current?.audio_tag?.pause?.()

                                if (!e?.target?.classList?.contains?.("play")) {

                                    refs.current.audio_btn = e?.target

                                    refs.current.audio_seekbar = e?.target?.parentElement?.querySelector('input')

                                    refs.current.audio_tag.src = state?.audio?.url

                                    refs?.current?.audio_tag?.play?.()
                                }
                            }}
                            type="button"
                        >
                            <PlaySvg />
                            <PauseSvg />
                        </button>
                        <input
                            type="range"
                            step="any"
                            onChange={(e) => {
                                if (refs?.current?.audio_seekbar && refs?.current?.['audio_tag']) {
                                    refs.current['audio_tag'].currentTime = e?.target?.value
                                } else if (!refs?.current?.audio_seekbar) {
                                    const button = e?.target?.parentElement?.querySelector('button')

                                    audio_live?.pause?.()

                                    if (!button?.classList?.contains('play')) {
                                        refs.current.audio_btn = button

                                        refs.current.audio_seekbar = e?.target

                                        refs.current.audio_tag.src = state?.audio?.url

                                        refs?.current?.audio_tag?.play?.()
                                    }
                                }
                            }}
                            className="non_active modal_audio_seekBar"
                        />
                    </div>
                }

                {state?.form && <form onSubmit={FormHanlde}>
                    <div className="upload">
                        <input className="file_input_box" onInput={(e) => {
                            if (e?.target?.files?.[0]?.size > 26214400) {
                                alert("File Size Allowed Maximum 25Mb")
                                e.target.value = ''
                                action({ type: "clear-file" })
                            } else if (e?.target?.files?.[0]) {
                                e.target.files[0].url = URL.createObjectURL(e?.target?.files?.[0])
                                action({ type: "file", file: e?.target?.files?.[0] })
                            }
                        }} type="file" accept="image/* , video/* , audio/*" required />

                        <ClipSvg />
                    </div>
                    <button type="button" onClick={CloseModal}>
                        <Xsvg class_name={"svg_path_fill"} />
                    </button>
                    <button type="submit">
                        <SendSvg
                            class_name={"svg_path_stroke"}
                        />
                    </button>
                </form>}

                <div className="progress" ref={(elm) => {
                    if (refs?.current) {
                        refs.current.upload_progress = elm
                    }
                }} />
            </div>

            <audio id="audio_tag" controls ref={(elm) => {
                if (refs?.current) {
                    refs.current.audio_tag = elm
                }
            }} />
        </section>
    )
})

export default Modal