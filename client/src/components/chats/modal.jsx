import React, { Fragment, forwardRef, useEffect, useImperativeHandle, useReducer, useRef } from 'react'
import { ClipSvg, PauseSvg, PlaySvg, SendSvg, Xsvg } from '../../assets'
import { useAudio } from '../../hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { axios } from '../../lib'
import { useSelector } from 'react-redux'

const reducer = (value, { type, ...actions }) => {
    switch (type) {
        case 'open':
            if (actions?.group) {
                return { ...value, active: true, form: true, group: actions?.group, image: actions?.group?.img }
            } else {
                return { ...value, active: true, form: actions?.form || undefined }
            }
        case 'close':
            return { active: undefined }
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
        case "abort_controller":
            return { ...value, abort_controller: actions?.data }

        case "progress":
            return { ...value, progrees: actions?.data }
        default:
            return value
    }
}

const Modal = forwardRef(({ audio_live, isUser }, ref) => {

    const refs = useAudio()

    const navigate = useNavigate()

    const { id } = useParams()

    const user = useSelector((state) => state?.user)

    const [state, action] = useReducer(reducer, {})

    const CloseModal = () => {
        state?.abort_controller?.abort?.()

        action({ type: "close" })

        if (refs?.current?.['audio_seekbar']?.classList?.contains('modal_audio_seekBar')) {
            refs?.current?.['audio_tag']?.pause?.()
        }
    }

    const LoadFriends = async (offset, search, groupId) => {
        if (state?.abort_controller) {
            state?.abort_controller?.abort?.()
        }

        const abortController = new AbortController()

        action({ type: 'abort_controller', data: abortController })

        try {
            let res = await axios.get('/chat-group/get_friends_group_add', {
                params: {
                    groupId: state?.group?._id || groupId,
                    offset: offset,
                    search: search
                },
                signal: abortController?.signal
            })

            console.log(res?.['data'])
        } catch (err) {
            if (err?.response?.data?.status == 405) {
                alert("Please Login")
                navigate('/')
            } else if (err?.code !== "ERR_CANCELED") {
                alert(err?.response?.data?.message || "Something Went Wrong");
            }
        }
    }

    const onUploadProgress = (e) => {
        const { loaded, total } = e;

        let percent = Math.floor((loaded * 100) / total);

        if (percent < 100) {
            action({ type: "progress", data: percent })
        } else {
            action({ type: 'close' })
        }
    };

    const FormHanlde = async (e) => {
        e?.preventDefault?.()

        if (state?.abort_controller) {
            state?.abort_controller?.abort?.()
        }

        const abortController = new AbortController()

        action({ type: 'abort_controller', data: abortController })

        if (isUser) {
            // for file share

            try {
                const formdata = new FormData();

                const date = new Date()

                formdata.append("id", Date?.now()?.toString(16))
                formdata.append("date", `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} | ${date.getHours()}:${date.getMinutes()}`)
                formdata.append("chatId", id)
                formdata.append("userId", user?._id)

                if (state?.video) {
                    formdata.append("file", state?.video)
                } else if (state?.audio) {
                    formdata.append("file", state?.audio)
                } else {
                    formdata.append("file", state?.image)
                }

                await axios.post('/chat-single/share_file', formdata, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    signal: abortController?.signal,
                    onUploadProgress
                })
            } catch (err) {
                if (err?.response?.data?.status == 405) {
                    alert("Please Login")
                    navigate('/')
                } else if (err?.code !== "ERR_CANCELED") {
                    alert(err?.response?.data?.message || "Something Went Wrong");
                } else {
                    alert("Cancelled Old Request")
                }
            }
        } else {
            try {
                if (state?.group?.members) {
                    console.log("ADD")
                } else if (state?.group?.create) {
                    // for create group
                    const form_data = new FormData(e?.target)

                    await axios.post('/chat-group/create_group', form_data, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                        signal: abortController?.signal,
                        onUploadProgress
                    })
                } else if (state?.group?._id) {
                    // for edit group
                    const form_data = new FormData(e?.target)

                    await axios.put(`/chat-group/edit_group?_id=${state?.group?._id}`, form_data, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                        signal: abortController?.signal,
                        onUploadProgress
                    })
                } else {
                    // for file share
                    const form_data = new FormData()

                    const date = new Date()

                    form_data.append("id", Date?.now()?.toString(16))
                    form_data.append("date", `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} | ${date.getHours()}:${date.getMinutes()}`)
                    form_data.append("groupId", id)
                    form_data.append("user", JSON.stringify(user))

                    if (state?.video) {
                        form_data.append("file", state?.video)
                    } else if (state?.audio) {
                        form_data.append("file", state?.audio)
                    } else {
                        form_data.append("file", state?.image)
                    }

                    await axios.post('/chat-group/share_file', form_data, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                        signal: abortController?.signal,
                        onUploadProgress
                    })
                }
            } catch (err) {
                if (err?.response?.data?.status == 405) {
                    alert("Please Login")
                    navigate('/')
                } else if (err?.code !== "ERR_CANCELED") {
                    alert(err?.response?.data?.message || "Something Went Wrong");
                } else {
                    alert("Cancelled Old Request")
                }
            }
        }
    }

    useEffect(() => {
        const ModalControl = (e) => {
            if (
                !refs?.current?.inner_modal?.contains(e?.target) &&
                !e?.target?.classList?.contains("chats_modal_special") &&
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
        Modal: (data, group) => {
            if (typeof data == 'object') {
                action({ type: "open" })
                action({ type: "file", file: data })
            } else if (group) {
                action({ type: "open", group })

                if (group?.members) {
                    LoadFriends?.(undefined, undefined, group?._id)
                }
            } else {
                action({ type: "open", form: data })
            }
        }
    }), [])

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
                                const button = e?.target?.parentElement?.querySelector('button')

                                audio_live?.pause?.()

                                if (refs?.current?.audio_seekbar && refs?.current?.['audio_tag']) {
                                    refs.current['audio_tag'].currentTime = e?.target?.value
                                }

                                if (!button?.classList?.contains('play')) {
                                    refs.current.audio_btn = button

                                    refs.current.audio_seekbar = e?.target

                                    refs.current.audio_tag.src = state?.audio?.url

                                    refs?.current?.audio_tag?.play?.()
                                }
                            }}
                            className="non_active modal_audio_seekBar"
                        />
                    </div>
                }

                {state?.form && <form onSubmit={FormHanlde}>
                    {
                        !state?.group ?
                            (<Fragment>
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
                                {
                                    !state?.progrees && <button type="submit">
                                        <SendSvg
                                            class_name={"svg_path_stroke"}
                                        />
                                    </button>
                                }
                            </Fragment>) :
                            state?.group?.members ?
                                <div className='add_members_group'>
                                    <div className='selected'>
                                        {[1, 2, 34, 5, 6, 1, 1, 1, 1]?.map?.((obj, key) => {
                                            return <div className="item" key={key}>
                                                <img src='http://localhost:5173/files/groups_logo/64fb43fde1cd02cf2eca5fd9.png' />
                                                <p>ANSNSNSNSNSNS</p>
                                            </div>
                                        })}

                                        <input placeholder='Search' />
                                    </div>

                                    <div className="list_friends">
                                        {[1, 2, 3, 34, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,]?.map((obj, key) => {
                                            return <div className="item" key={key}>
                                                <img src='http://localhost:5173/files/groups_logo/64fb43fde1cd02cf2eca5fd9.png' />
                                                <p>ANSNSNSNSNSNSaaaaaaaaaaaaaaaaaaaaaaaa</p>
                                            </div>
                                        })}

                                        <button type='button' onClick={() => {
                                            LoadFriends()
                                        }} data-for="loadmore">
                                            MORE
                                        </button>
                                    </div>

                                    <div className='devide'>
                                        <button type='submit'>
                                            add
                                        </button>
                                    </div>
                                </div>
                                : (<div className='group_create'>
                                    <div className="upload">
                                        <input name='file' className="file_input_box" onInput={(e) => {
                                            if (e?.target?.files?.[0]) {
                                                e.target.files[0].url = URL.createObjectURL(e?.target?.files?.[0])
                                                action({ type: "file", file: e?.target?.files?.[0] })
                                            }
                                        }} type="file" accept="image/*" {...{ required: state?.group?.create }} />

                                        <ClipSvg />
                                    </div>
                                    <input name='name' placeholder={state?.group?.name || 'Enter Group Name'} {...{ required: state?.group?.create }} />
                                    <textarea name='about' placeholder={state?.group?.about || 'Enter About'} {...{ required: state?.group?.create }} />

                                    {!state?.progrees && <button type="submit">
                                        {state?.group?.create ? 'Create' : 'Edit'}
                                    </button>}
                                </div>)
                    }
                </form>}

                <div
                    className={`progress ${state?.progrees ? 'active' : 'hide'}`}
                    style={{ background: `linear-gradient(to right, #6b8afd 0%, #6b8afd ${state?.progrees}%, #333 ${state?.progrees}%, #333 100%)` }}
                />
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