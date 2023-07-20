import React, { Fragment } from "react";
import { Route, Routes } from "react-router-dom";
import { Account, Chats, Groups, Stories } from "./pages";
import { Loading, Menu } from "./components";
import { Login, SignUp, Notification } from "./features";
import { useSelector } from "react-redux";
import ProtectedRoute from "./utils/ProtectedRoute";
import FourNotFour from "./pages/404";
import "./App.scss";

function App() {
  const { loading, menu, notification } = useSelector(
    (state) => state?.additional
  );
  return (
    <Fragment>
      {menu && <Menu />}
      {loading && <Loading />}

      <section data-for={menu ? "contents" : "fit-content"}>
        {menu && notification ? <Notification /> : null}

        <Routes>
          <Route element={<ProtectedRoute isAuth />}>
            <Route path="/" exact element={<Chats />} />
            <Route path="/chat/:id" element={<Chats />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<Groups />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:id" element={<Stories />} />
            <Route path="/account" element={<Account />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          <Route path="*" element={<FourNotFour />} />
        </Routes>
      </section>
    </Fragment>
  );
}

export default App;
