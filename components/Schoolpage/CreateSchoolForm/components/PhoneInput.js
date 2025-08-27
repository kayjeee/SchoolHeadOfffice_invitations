import React from "react";
import FormComponent from "../../../FormComponent";

const PhoneInput = ({ value, onChange }) => {
  return (
    <FormComponent
      label="Phone Number"
      type="tel"
      value={value}
      onChange={onChange}
      placeholder="+1 234 567 890"
    />
  );
};

export default PhoneInput;
