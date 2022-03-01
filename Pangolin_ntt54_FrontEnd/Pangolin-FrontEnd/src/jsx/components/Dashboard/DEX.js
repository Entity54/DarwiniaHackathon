import React,{useState,useContext, useEffect} from 'react';
 
import { ThemeContext } from "../../../context/ThemeContext";
import QuickTrade from '../Boltz/Home/ntt54_QuickTrade';
import Faucet from '../Boltz/Home/ntt54_Faucet';


const DEX = ({ setupSpecs, portfolio, oracleData, accountList, blockHeader }) => {
	const { changeBackground, background } = useContext(ThemeContext);
	
	useEffect(() => {
		changeBackground({ value: "dark", label: "Dark" });
	}, []);
	return(
		<>
				<div className="col-xl-12">
					<div className="row" style={{marginTop:"0px"}}>
						<div className="col-xl-3 col-xxl-12">
						</div>
						<div className="col-xl-6 col-xxl-12">
							<QuickTrade setupSpecs={setupSpecs} portfolio={portfolio} oracleData={oracleData} accountList={accountList} blockHeader={blockHeader}/>
						</div>
						<div className="col-xl-3 col-xxl-12">
						</div>
					</div>

					<div className="row" style={{marginTop:"50px"}}>
						<div className="col-xl-1 col-xxl-12">
						</div>
						<div className="col-xl-10 col-xxl-12">
							<Faucet setupSpecs={setupSpecs} portfolio={portfolio} oracleData={oracleData} accountList={accountList} blockHeader={blockHeader} />
						</div>
						<div className="col-xl-1 col-xxl-12">
						</div>
					</div>
				</div>
		</>
	)
}
export default DEX;