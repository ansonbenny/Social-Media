import React, { useEffect, useState } from "react";
import { Input } from "../components";
import { LogoutSvg } from "../assets";

const Account = () => {
  const [size, setSize] = useState({
    sm: window.matchMedia("(max-width:680px)")?.matches,
  });

  useEffect(() => {
    const onResize = () => {
      setSize({
        sm: window.matchMedia("(max-width:680px)")?.matches,
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="account">
      <div className="content">
        <button className="logout">
          <LogoutSvg width={"20px"} height={"20px"} />
        </button>

        <form action="">
          <div className="cover">
            <img
              src="https://m.media-amazon.com/images/M/MV5BMjI4NDE1MjE1Nl5BMl5BanBnXkFtZTgwNzQ2MTMzOTE@._V1_.jpg"
              alt="profile"
            />
          </div>
          <Input name={"name"} placeholder={"Enter Name"} label={"Full Name"} />

          <Input
            name={"description"}
            placeholder={"Enter Description"}
            label={"Description"}
            isTextArea
          />

          <Input name={"email"} placeholder={"Enter Email"} label={"Email"} />

          <Input
            name={"number"}
            placeholder={"Enter Number"}
            label={"Number"}
          />

          <div className="otp">
            <Input name={"OTP"} placeholder={"Enter OTP"} label={"OTP*"} />
            <button type="button" className="resend">
              Resend
            </button>
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>

      {!size?.sm && (
        <div className="mesg_empty">
          <h1>Select a chat to start messaging</h1>
        </div>
      )}
    </section>
  );
};

export default Account;
