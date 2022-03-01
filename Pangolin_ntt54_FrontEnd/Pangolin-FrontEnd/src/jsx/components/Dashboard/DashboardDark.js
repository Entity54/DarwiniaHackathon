import React,{useState,useContext, useEffect} from 'react';
import { ThemeContext } from "../../../context/ThemeContext";
import MARKET from "./MARKET";


const DashboardDark = ({ setupSpecs, oracleData, blockHeader, accountList }) => {
	const { changeBackground, background } = useContext(ThemeContext);
	
	useEffect(() => {
		changeBackground({ value: "dark", label: "Dark" });

	}, []);

	return(
		<>
			<div className="row">
				<div className="row">
					<div className="col-xl-12">
						<MARKET className="col-xl-12" blockHeader={blockHeader} oracleData={oracleData}/>	
					</div>
				</div>
			</div>	
		</>
	)
}
export default DashboardDark;