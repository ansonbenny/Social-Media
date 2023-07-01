import React, { useEffect, useState } from "react";
import { Input } from "../components";
import { AvatarSvg, LogoutSvg } from "../assets";
import { setLoading } from "../redux/additional";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const Account = () => {
  const dispatch = useDispatch();

  const location = useLocation();

  const user = useSelector((state) => state?.user);

  const [state, setState] = useState({
    otp: undefined,
    form: {
      ...user,
    },
    size_sm: window.matchMedia("(max-width:680px)")?.matches,
  });

  const InputHandle = (e) => {
    e?.preventDefault?.();

    if (e?.target?.name === "email") {
      setState((state) => ({
        ...state,
        otp: undefined,
      }));
    }

    setState((state) => ({
      ...state,
      form: {
        ...state?.form,
        [e?.target?.name]: e?.target?.value,
      },
    }));
  };

  const FormHandle = (e) => {
    e?.preventDefault?.();
  };

  useEffect(() => {
    document.title = "Soft Chat - Account";

    if (user) {
      setTimeout(() => {
        dispatch(setLoading(false));
      }, 1000);
    } else {
      dispatch(setLoading(true));
    }

    const onResize = () => {
      setState((state) => ({
        ...state,
        size_sm: window.matchMedia("(max-width:680px)")?.matches,
      }));
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [user, location]);

  return (
    <section className="account">
      <div className="content">
        <button className="logout">
          <LogoutSvg width={"20px"} height={"20px"} />
        </button>

        <form onSubmit={FormHandle}>
          <div className="cover">
            {state?.form?.img ? (
              <img
                src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
                alt="profile"
              />
            ) : (
              <AvatarSvg height={"4.5rem"} width={"4.5rem"} />
            )}

            <div className="uploading" />

            <Input type="file" accept="image/*" />
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

          {state?.otp && (
            <div className="otp">
              <Input
                name={"OTP"}
                placeholder={"Enter OTP"}
                label={"OTP*"}
                value={state?.form?.OTP || ""}
                onChange={InputHandle}
              />
              <button type="button" className="resend">
                Resend
              </button>
            </div>
          )}

          {state?.otp ? (
            <button type="submit">Submit</button>
          ) : (
            <button type="submit">Sent Otp</button>
          )}
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
