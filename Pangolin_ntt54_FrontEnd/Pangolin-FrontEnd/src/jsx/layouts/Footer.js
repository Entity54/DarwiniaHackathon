 import React from "react";

const Footer = () => {
  var d = new Date();
  return (
    <div className="footer">
      <div className="copyright">
        <p>
          {/* Copyright © Designed &amp; Developed by{" "} */}
          <a href="ntt54" target="_blank" rel="noreferrer">
            ntt54
          </a>{" "}
          {d.getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Footer;
