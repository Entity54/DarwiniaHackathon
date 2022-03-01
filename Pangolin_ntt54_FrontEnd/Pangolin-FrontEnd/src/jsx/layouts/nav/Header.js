import React, { useEffect, useState } from 'react'    

import { Dropdown } from "react-bootstrap";


const Header = ({ setupSpecs, blockHeader, evm_api_state, accountList, selectedAccountName }) => {


	const [dropdowncolor, setDropdowncolor] = useState("#DE5106");
	const [dropdownDisabled, setDropdownDisabled] = useState(true);		

  

  useEffect(() => {
      if (evm_api_state)
      {
        setDropdowncolor("white");
        setDropdownDisabled(false);
      } else {
        setDropdowncolor("#DE5106");
        setDropdownDisabled(true);
      }
  },[evm_api_state])


  return (
    <div className="header">
      <div className="header-content">
        <nav className="navbar navbar-expand">
          <div className="collapse navbar-collapse justify-content-between">
            <div className="header-left">
            <li className="nav-item">
              <div  style={{ width: "50vw"}}> 
                <div style={{ width: "100v%" }}> 
                {/* TODO GENERAL INFO */}
                </div> 
              </div>
            </li>
            </div>

            <ul className="navbar-nav header-right main-notification" style={{backgroundColor:""}}>
              <Dropdown className="weather-btn mb-2" style={{backgroundColor:"#171622"}}>
                    <span className="fs-22 font-w600 d-flex" style={{color: dropdowncolor,  backgroundColor:"#171622"}}><i className="fa fa-google-wallet me-3 ms-3"></i></span>
                    <span className="fs-14 font-w600 d-flex" style={{color: dropdowncolor, backgroundColor:"#171622", marginRight:"10px"}}>{accountList? accountList : "Sign in to Metamask"}</span>
              </Dropdown>  

              <div className="timeline-panel" style={{ marginTop:"20px", }}>
                    <div className="media me-2">
                      {/* TODO IDENTICON */}
                    </div>
                    <div className="media-body" style={{ marginTop:"5px", }}>
                      <h6 className="mb-1">{selectedAccountName}</h6>
                    </div>
              </div>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Header;
