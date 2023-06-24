import React, { Fragment } from "react";

const Input = ({ placeholder, name, label, onHandle, isTextArea }) => {
  return (
    <Fragment>
      <label>{label}</label>
      {isTextArea ? (
        <textarea name={name} placeholder={placeholder} onChange={onHandle} />
      ) : (
        <input name={name} placeholder={placeholder} onChange={onHandle} />
      )}
    </Fragment>
  );
};

export default Input;
