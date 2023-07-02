import React, { Fragment } from "react";

const Input = ({ label, isTextArea, ...others }) => {
  return (
    <Fragment>
      {
        label && <label>{label}</label>
      }
      {isTextArea ? <textarea {...others} /> : <input {...others} />}
    </Fragment>
  );
};

export default Input;
