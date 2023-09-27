import React, { Fragment } from "react";
import { Route, Routes } from "react-router-dom";
import { Account, AudioCall, Chats, Groups, Stories, VideoCall } from "./pages";
import { Loading } from "./components";
import { Login, Offline, SignUp } from "./features";
import { useSelector } from "react-redux";
import ProtectedRoute from "./utils/ProtectedRoute";
import FourNotFour from "./pages/404";
import "./App.scss";

function App() {
  const loading = useSelector((state) => state?.additional?.loading);

  return (
    <Fragment>
      <Offline />

      {loading && <Loading />}

      <Routes>
        <Route element={<ProtectedRoute isAuth />}>
          <Route path="/" exact element={<Chats />} />
          <Route path="/chat/:id" element={<Chats />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<Groups />} />
          <Route path="/video-call" element={<VideoCall />} />
          <Route path="/audio-call" element={<AudioCall />} />
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
    </Fragment>
  );
}

export default App;
