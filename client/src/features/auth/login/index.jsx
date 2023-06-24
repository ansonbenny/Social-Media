import React from "react";
import { GoogleSvg } from "../../../assets";
import { Input } from "../../../components";
import "../style.scss";

const Login = () => {
  return (
    <section className="auth">
      <div className="content">
        <h1>Login</h1>
        <p>Login and chat to your friends.</p>

        <button className="google">
          <GoogleSvg width={"20px"} height={"20px"} />
          Login With Google
        </button>

        <div className="border">
          <div className="left" />
          <p>OR</p>
          <div className="right" />
        </div>

        <form action="">
          <Input
            name={"number"}
            placeholder={"Enter Number"}
            label={"Number*"}
          />

          <div className="otp">
            <Input name={"OTP"} placeholder={"Enter OTP"} label={"OTP*"} />
            <button type="button" className="resend">
              Resend
            </button>
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
    </section>
  );
};

export default Login;
