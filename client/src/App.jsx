import React, { Fragment } from "react";
import { Route, Routes } from "react-router-dom";
import { Chats, Groups, Stories } from "./pages";
import { Menu } from "./components";
import "./App.scss";

function App() {
  return (
    <Fragment>
      <Menu />
      <div data-for="contents">
        <Routes>
          <Route path="/" exact element={<Chats />} />
          <Route path="/chat/:id" element={<Chats />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<Groups />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:id" element={<Stories />} />
        </Routes>
      </div>
    </Fragment>
  );
}

export default App;
