import React, { useEffect, useState } from "react";
import { GoogleSvg } from "../../assets";
import { Input } from "../../components";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoading } from "../../redux/additional";
import { useGoogleLogin } from "@react-oauth/google";
import { axios } from "../../lib";
import "./style.scss";

const Login = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [state, setState] = useState({
    form: {},
    otp: undefined,
    error: undefined,
  });

  const Google = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await axios.get("/user/login-google", {
          params: {
            google: response?.access_token,
          },
        });

        if (res?.["data"]) {
          navigate("/");
        }
      } catch (err) {
        setState((state) => ({
          ...state,
          error:
            typeof err?.response?.data?.message === "string"
              ? err?.response?.data?.message
              : "Failing Google Login",
        }));
      }
    },
    onError: (err) => {
      setState((state) => ({
        ...state,
        error: "Failing Google Login",
      }));
    },
    cookiePolicy: "single-host-origin",
  });

  const InputHandle = (e) => {
    e?.preventDefault?.();

    if (e?.target?.name === "email") {
      setState((state) => ({
        ...state,
        form: { ...state?.form, OTP: "" },
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

  const FormHandle = async (e, resend) => {
    e?.preventDefault?.();

    setState((state) => ({
      ...state,
      error: undefined,
    }));

    try {
      if (state?.otp && !resend) {
        let res = await axios.post("/user/login-verify", state?.form);

        if (res?.["data"]) {
          navigate("/");
        }
      } else {
        setState((state) => ({
          ...state,
          otp: {
            sent: resend
          }
        }))

        let res = await axios.post("/user/login-otp", state?.form);

        if (res?.["data"]) {
          setState((state) => ({
            ...state,
            otp: {
              sent: true
            },
          }));
        }
      }
    } catch (err) {
      setState((state) => ({
        ...state,
        error:
          typeof err?.response?.data?.message === "string"
            ? err?.response?.data?.message
            : "Something Went Wrong",
        otp: state?.otp?.sent && { sent: true }
      }));
    }
  };

  useEffect(() => {
    document.title = "Soft Chat - Login";

    const timer = setTimeout(() => {
      dispatch(setLoading(false));
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="auth">
      <div className="content">
        <h1>Login</h1>

        {state?.error && <p className="error">{state?.error}</p>}

        <p>Login and chat to your friends.</p>

        <button className="google" onClick={Google}>
          <GoogleSvg width={"20px"} height={"20px"} />
          Login With Google
        </button>

        <div className="border">
          <div className="left" />
          <p>OR</p>
          <div className="right" />
        </div>

        <form onSubmit={FormHandle}>
          <Input
            name={"email"}
            placeholder={"Enter Email"}
            label={"Email*"}
            type={"email"}
            value={state?.form?.email || ""}
            onChange={InputHandle}
            required
          />

          {state?.otp ?
            (state?.otp?.sent ?
              <>
                <div className="otp">
                  <Input
                    name={"OTP"}
                    placeholder={"Enter OTP"}
                    label={"OTP*"}
                    type={"number"}
                    value={state?.form?.OTP || ""}
                    onChange={InputHandle}
                    required
                  />
                  <button
                    type="button"
                    className="resend"
                    onClick={() => {
                      FormHandle(undefined, true);
                    }}
                  >
                    Resend
                  </button>
                </div>

                <button data-for="form_submit" type="submit">Login</button>
              </>
              : <button data-for="form_submit" type="button">Senting</button>
            )
            : <button data-for="form_submit" type="submit">Sent Otp</button>
          }
        </form>

        <p className="or">
          Don't you have account?
          <Link to={"/signup"}>SignUp</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
