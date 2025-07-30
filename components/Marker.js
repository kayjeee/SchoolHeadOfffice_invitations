import React from "react";

const Marker = ({ text }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <img src='/close.svg' alt="Marker" width="30" height="30" />
    <div>{text}</div>
  </div>
);

export default Marker;
