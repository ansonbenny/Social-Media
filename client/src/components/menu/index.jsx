import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChatsSvg,
  GroupsSvg,
  LogoutSvg,
  SettingsSvg,
  SmileySvg,
  ThemeSvg,
} from "../../assets";
import { axios } from "../../lib";
import "./style.scss";

const Menu = () => {
  const location = useLocation();

  const navigate = useNavigate();

  // change theme to light or dark
  const ChangeTheme = (click) => {
    let theme = localStorage.getItem("theme");

    const dark = () => {
      localStorage.setItem("theme", "dark");

      document.body?.classList?.add("dark");
      document.body?.classList?.remove("light");
    };

    const light = () => {
      localStorage.removeItem("theme");

      document.body?.classList?.add("light");
      document.body?.classList?.remove("dark");
    };

    if (click) {
      switch (theme ? theme : null) {
        case "dark":
          light();
          break;
        default:
          dark();
          break;
      }
    } else {
      switch (theme ? theme : null) {
        case "dark":
          dark();
          break;
        default:
          light();
          break;
      }
    }
  };

  // to logout button
  const logout = async () => {
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
    ChangeTheme();
  }, [location]);

  return (
    <section className="menu-global">
      <div className="main">
        <h1>SC</h1>
        <button
          className={
            location?.pathname === "/"
              ? "active"
              : location?.pathname?.includes("/chat")
              ? "active"
              : ""
          }
          onClick={() => {
            navigate("/");
          }}
        >
          <ChatsSvg width={"22px"} height={"22px"} />
        </button>
        <button
          className={location?.pathname?.includes("/groups") ? "active" : ""}
          onClick={() => {
            navigate("/groups");
          }}
        >
          <GroupsSvg width={"22px"} height={"22px"} />
        </button>
        <button
          className={location?.pathname?.includes("/stories") ? "active" : ""}
          onClick={() => {
            navigate("/stories");
          }}
        >
          <SmileySvg width={"22px"} height={"22px"} />
        </button>
        <button onClick={() => ChangeTheme(true)}>
          <ThemeSvg width={"22px"} height={"22px"} />
        </button>
        <button
          className={
            location?.pathname === "/account" ||
            location?.pathname === "/account/"
              ? "active"
              : ""
          }
          onClick={() => {
            navigate("/account");
          }}
        >
          <SettingsSvg width={"22px"} height={"22px"} />
        </button>
        <button className="logout" onClick={logout}>
          <LogoutSvg width={"22px"} height={"22px"} />
        </button>
      </div>
    </section>
  );
};

export default Menu;
