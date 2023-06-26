import React, { Fragment } from "react";
import { Route, Routes } from "react-router-dom";
import { Account, Chats, Groups, Stories } from "./pages";
import { Loading, Menu } from "./components";
import { Login, SignUp } from "./features";
import "./App.scss";

function App() {
  return (
    <Fragment>
      {true && <Menu />}
      {false && <Loading />}
      <section data-for={true ? "contents" : "fit-content"}>
        {
          // false for auth page
        }

        <Routes>
          <Route path="/" exact element={<Chats />} />
          <Route path="/chat/:id" element={<Chats />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<Groups />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:id" element={<Stories />} />
          <Route path="/account" element={<Account />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </section>
    </Fragment>
  );
}

export default App;
