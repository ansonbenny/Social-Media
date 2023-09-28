import React, { useEffect, useReducer, useRef, useState } from "react";
import { Input, Modal } from "../components";
import { AvatarSvg, LogoutSvg } from "../assets";
import { setLoading } from "../redux/additional";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { axios } from "../lib";

const reducer = (value, { type, data }) => {
  switch (type) {
    case 'size':
      return { ...value, size_sm: window.matchMedia("(max-width:680px)")?.matches }

    case "avatar":
      return { ...value, form: { ...value?.form, img: URL.createObjectURL(data) } }

    case "input":
      if (data?.name == "email") {
        return { ...value, otp: undefined, form: { ...value?.form, OTP: "", [data?.name]: data?.value } }
      } else {
        return { ...value, form: { ...value?.form, [data?.name]: data?.value } }
      }

    case "progress":
      if (data < 100) {
        return { ...value, uploading: { status: true, percent: data } }
      } else {
        return { ...value, uploading: {} }
      }

    case "reset_form":
      return { ...value, otp: undefined, form: { ...value?.form, OTP: "" } }

    case "otp_sented":
      return { ...value, otp: data }

    case "remove_avatar":
      return { ...value, form: { ...value?.form, img: null } }

    default:
      return value
  }
}

const Account = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const ref = useRef({});

  const user = useSelector((state) => state?.user)

  const [state, action] = useReducer(reducer, {
    form: {
      ...user,
      img: user?.img && `/files/profiles/${user?.img}`,
    },
    size_sm: window.matchMedia("(max-width:680px)")?.matches,
  })

  const InputHandle = async (e) => {
    e?.preventDefault?.();

    if (e?.target?.name === "avatar") {
      action({ type: "avatar", data: e?.target?.files?.[0] })

      const formData = new FormData();
      // appending file to formData
      formData.append("avatar", e?.target?.files?.[0]);

      try {
        await axios.put("/user/change-avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress,
        });
      } catch (err) {
        if (err?.response?.data?.status === 405) {
          alert("Please Login");
          navigate("/login");
        } else {
          alert("Something Went Wrong");
        }
      }

      if (ref?.current?.div) {
        ref.current.div.style.display = "none";
      }
    } else {
      action({ type: 'input', data: e?.target })
    }
  };

  const onUploadProgress = (e) => {
    const { loaded, total } = e;

    let percent = Math.floor((loaded * 100) / total);

    action({ type: "progress", data: percent })
  };

  const FormHandle = async (e, resend) => {
    e?.preventDefault?.();

    try {
      if (state?.otp && !resend) {
        let res = await axios.put(`/user/edit-profile-verify`, {
          name: state?.form?.name,
          about: state?.form?.about,
          number: state?.form?.number,
          email: state?.form?.email,
          OTP: state?.form?.OTP,
        });

        if (res?.["data"]) {
          action({ type: "reset_form" })
        }
      } else {
        action({ type: "otp_sented", data: { sent: resend } })

        let res = await axios.post(`/user/edit-profile-otp`, {
          name: state?.form?.name,
          about: state?.form?.about,
          number: state?.form?.number,
          email: state?.form?.email,
        });

        if (res?.["data"]?.data?.otp) {
          action({ type: "otp_sented", data: { sent: true } })
        }
      }
    } catch (err) {
      if (err?.response?.data?.status === 405) {
        alert("Please Login");
        navigate("/login");
      } else {
        alert(
          typeof err?.response?.data?.message === "string"
            ? err?.response?.data?.message
            : "Something Went Wrong"
        );

        action({ type: "otp_sented", data: state?.otp?.sent && { sent: true } })
      }
    }
  };

  // to logout button
  const LogOut = async () => {
    try {
      let res = await axios.get("/user/logout");

      if (res?.["data"]) {
        navigate("/login");
      }
    } catch (err) {
      alert("Sorry Something Went Wrong");
    }
  };

  useEffect(() => {
    document.title = "Soft Chat - Account";

    let timer;

    if (user) {
      timer = setTimeout(() => {
        dispatch(setLoading(false));
      }, 1000);
    } else {
      dispatch(setLoading(true));
    }

    const onResize = () => {
      action({ type: 'size' })
    };

    const onClick = (e) => {
      if (
        !ref?.current?.div?.contains(e?.target) &&
        !ref?.current?.img?.contains(e?.target)
      ) {
        if (ref?.current?.div) {
          ref.current.div.style.display = "none";
        }
      }
    };

    window.addEventListener("resize", onResize);

    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("click", onClick);

      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="account">
      <div className="content">
        <Modal ref={(elm) => {
          if (ref?.current) {
            ref.current.PopUp = elm
          }
        }} />

        <button className="logout" onClick={LogOut}>
          <LogoutSvg width={"20px"} height={"20px"} />
        </button>

        <form onSubmit={FormHandle}>
          <div className="cover">
            {state?.form?.img ? (
              <>
                <img
                  src={state?.form?.img}
                  alt="profile"
                  ref={(elm) => {
                    if (ref?.current) {
                      ref.current.img = elm;
                    }
                  }}
                  onClick={() => {
                    if (ref?.current?.div) {
                      ref.current.div.style.display = "block";
                    }
                  }}
                />

                {!state?.uploading?.status && (
                  <div
                    className="actions_cover"
                    ref={(elm) => {
                      if (ref?.current) {
                        ref.current.div = elm;
                      }
                    }}
                  >
                    <div className="list">
                      <button
                        className="chats_modal_special"
                        type="button"
                        onClick={() => {
                          ref?.current?.PopUp?.Modal?.({
                            url: state?.form?.img,
                            type: "image"
                          })
                        }}
                      >
                        Show Image
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            let res = await axios.delete("/user/remove-avatar");

                            if (res?.["data"]) {
                              action({ type: "remove_avatar" })
                            }
                          } catch (err) {
                            if (err?.response?.data?.status === 405) {
                              alert("Please Login");
                              navigate("/login");
                            } else {
                              alert("Something Went Wrong");
                            }
                          }
                        }}
                      >
                        Remove Image
                      </button>

                      <button type="button" data-for="input">
                        <Input
                          name="avatar"
                          type="file"
                          accept="image/*"
                          onChange={InputHandle}
                        />
                        Change Image
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={`uploading ${state?.uploading?.status ? "active" : ""
                    }`}
                  style={{
                    background: `linear-gradient(to right, #6b8afd ${state?.uploading?.percent}%, #fff 0%)`,
                  }}
                />
              </>
            ) : (
              <>
                <AvatarSvg height={"4.5rem"} width={"4.5rem"} />

                <div
                  className={`uploading ${state?.uploading?.status ? "active" : ""
                    }`}
                  style={{
                    background: `linear-gradient(to right, #6b8afd ${state?.uploading?.percent}%, #fff 0%)`,
                  }}
                />

                <Input
                  name="avatar"
                  type="file"
                  accept="image/*"
                  onChange={InputHandle}
                />
              </>
            )}
          </div>
          <Input
            name={"name"}
            placeholder={"Enter Name"}
            label={"Full Name"}
            type="text"
            value={state?.form?.name || ""}
            onChange={InputHandle}
            required
          />

          <Input
            name={"about"}
            placeholder={"Enter About"}
            label={"About"}
            type="text"
            value={state?.form?.about || ""}
            onChange={InputHandle}
            isTextArea
            required
          />

          <Input
            name={"email"}
            placeholder={"Enter Email"}
            label={"Email"}
            type="email"
            value={state?.form?.email || ""}
            onChange={InputHandle}
            required
          />

          <Input
            name={"number"}
            placeholder={"Enter Number"}
            label={"Number"}
            type="number"
            value={state?.form?.number || ""}
            onChange={InputHandle}
            required
          />

          {state?.otp ? (
            state?.otp?.sent ? <>
              <div className="otp">
                <Input
                  name={"OTP"}
                  placeholder={"Enter OTP"}
                  label={"OTP*"}
                  value={state?.form?.OTP || ""}
                  onChange={InputHandle}
                />
                <button
                  type="button"
                  onClick={() => {
                    FormHandle(undefined, true);
                  }}
                  className="resend"
                >
                  Resend
                </button>
              </div>

              <button data-for="submit" type="submit">
                Submit
              </button>
            </>

              : <button data-for="submit" type="button">
                Senting
              </button>
          ) :
            <button data-for="submit" type="submit">
              Sent Otp
            </button>}

        </form>
      </div>

      {!state?.size_sm && (
        <div className="mesg_empty">
          <h1>Select a chat to start messaging</h1>
        </div>
      )}
    </section>
  );
};

export default Account;
