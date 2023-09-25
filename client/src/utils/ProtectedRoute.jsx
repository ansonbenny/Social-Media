import React, { useLayoutEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { setLoading } from "../redux/additional";
import { fetchUser } from "../redux/user";
import { Menu } from "../components";
import { Notification } from "../features";

const ProtectedRoute = ({ isAuth }) => {
  const [component, setComponent] = useState(null); // for show component / page

  const location = useLocation();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  useLayoutEffect(() => {
    dispatch(setLoading(true));

    const abortControl = new AbortController();

    (async () => {
      let res = await dispatch(fetchUser(abortControl?.signal));

      if (res?.payload) {
        // res?.payload is the user details
        if (isAuth) {
          setComponent(
            <section data-for="contents">
              <Notification />
              <Menu />
              <Outlet />
            </section>
          );
        } else {
          navigate("/");
        }
      } else if (res?.error && res?.error?.code !== "ERR_CANCELED") {
        if (isAuth) {
          navigate("/login");
        } else if (!isAuth) {
          setComponent(
            <section data-for="fit-content">
              <Outlet />
            </section>
          );
        }
      }
    })();

    return () => {
      abortControl?.abort?.();
    };
  }, [location?.pathname, isAuth]);

  return component;
};

export default ProtectedRoute;
