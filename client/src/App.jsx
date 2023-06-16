import React, { Fragment } from "react";
import { Route, Routes } from "react-router-dom";
import { Chats } from "./pages";
import { Menu } from "./components";
import "./App.scss";

function App() {
  return (
    <Fragment>
      <Menu />
      <div data-for="contents">
        <Routes>
          <Route path="/" exact element={<Chats />} />
          <Route path="/chat/:id" exact element={<Chats />} />
        </Routes>
      </div>
    </Fragment>
  );
}

export default App;
