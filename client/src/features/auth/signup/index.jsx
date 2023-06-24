import React from "react";
import { Input } from "../../../components";
import { GoogleSvg } from "../../../assets";
import "../style.scss";

const SignUp = () => {
  return (
    <section className="auth">
      <div className="content">
        <h1>Create Account</h1>
        <p>Sign Up and chat to your friends.</p>

        <button className="google">
          <GoogleSvg width={"20px"} height={"20px"} />
          Sign Up With Google
        </button>

        <div className="border">
          <div className="left" />
          <p>OR</p>
          <div className="right" />
        </div>

        <form action="">
          <Input
            name={"name"}
            placeholder={"Enter Name"}
            label={"Full Name*"}
          />
          <Input name={"email"} placeholder={"Enter Email"} label={"Email*"} />
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

          <button type="submit">Create account</button>
        </form>
      </div>
    </section>
  );
};

export default SignUp;
