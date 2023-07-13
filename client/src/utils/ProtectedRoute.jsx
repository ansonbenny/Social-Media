import React, { useLayoutEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { setLoading, setMenu } from "../redux/additional";
import { fetchUser } from "../redux/user";
import axios from "axios";

const ProtectedRoute = ({ isAuth }) => {
  const [component, setComponent] = useState(null); // for show component / page

  const location = useLocation();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  useLayoutEffect(() => {
    const cancelToken = axios.CancelToken.source();

    dispatch(setLoading(true));

    (async () => {
      let res = await dispatch(fetchUser(cancelToken));

      if (res?.payload) {
        if (isAuth) {
          dispatch(setMenu(true));
          setComponent(<Outlet />);
        } else {
          dispatch(setMenu(false));
          navigate("/");
        }
      } else if (res?.error && res?.error?.code !== "ERR_CANCELED") {
        dispatch(setMenu(false));

        if (isAuth) {
          navigate("/login");
        } else if (!isAuth) {
          setComponent(<Outlet />);
        }
      }
    })();

    return () => {
      cancelToken.cancel();
    };
  }, [location, isAuth]);

  return component;
};

export default ProtectedRoute;
