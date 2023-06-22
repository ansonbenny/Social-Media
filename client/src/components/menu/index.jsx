import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  ChatsSvg,
  GroupsSvg,
  LogoutSvg,
  SettingsSvg,
  SmileySvg,
  ThemeSvg,
} from "../../assets";
import "./style.scss";

const Menu = () => {
  const location = useLocation();

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

  useEffect(() => {
    ChangeTheme();
  }, [location]);

  return (
    <section className="menu-global">
      <div className="main">
        <h1>AB</h1>
        <button className="active">
          <ChatsSvg
            width={"22px"}
            height={"22px"}
          />
        </button>
        <button>
          <GroupsSvg width={"22px"} height={"22px"} />
        </button>
        <button>
          <SmileySvg width={"22px"} height={"22px"} />
        </button>
        <button onClick={() => ChangeTheme(true)}>
          <ThemeSvg width={"22px"} height={"22px"} />
        </button>
        <button>
          <SettingsSvg
            width={"22px"}
            height={"22px"}
          />
        </button>
        <button className="logout">
          <LogoutSvg width={"22px"} height={"22px"} />
        </button>
      </div>
    </section>
  );
};

export default Menu;
