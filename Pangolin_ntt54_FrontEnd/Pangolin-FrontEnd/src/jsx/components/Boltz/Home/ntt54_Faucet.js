import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import { setWallet, getFaucetMinted, getFaucetBalanceLeft, faucet, _ } from '../../../../ntt54Dex.js';         


const QuickTrade = ({setupSpecs, accountList}) => {
	const [swapWithExactSupply_IsSubmiting, setSwapWithExactSupply_IsSubmiting] = useState(false);
	const [input_Supply, setInput_Supply] = useState("");
	const [leftFaucetAllowance, setLeftFaucetAllowance] = useState(0);
	 
	const faucetMyAccount = async () => {
		console.log(`FAUCET MY ACCOUNT HAS BEEN TRIGERRED YUPI leftFaucetAllowance:${leftFaucetAllowance} input_Supply:${input_Supply}`);
		setSwapWithExactSupply_IsSubmiting(true);
		const stableToTransferFrom = Math.min(Number(leftFaucetAllowance),Number(input_Supply)) ;
		
		if (stableToTransferFrom > 1)
		{
			console.log(`FAUCET stableToTransferFrom is > 1 So we will mint stable`)
			faucet( stableToTransferFrom )
			.then(resMsg => {
				console.log(`faucetMyAccount resMsg: `,resMsg);
				checkLeftFaucetAllowance(accountList[0]);
			})
			.catch( er => console.log(`faucetMyAccount er: `,faucetMyAccount));
			setSwapWithExactSupply_IsSubmiting(false);
		}
        else
		{
			console.log(`NO STABLE TO MINT`);
			setSwapWithExactSupply_IsSubmiting(false);
		}

	}  

	useEffect( () => {
		if (setupSpecs.wallet)
		{
			setWallet(setupSpecs.wallet);
		    if (accountList && accountList.length>0) checkLeftFaucetAllowance(accountList[0]);
		}
	},[accountList,setupSpecs]);

	// const stableLeftToClaimFromFaucet = await getFaucetBalanceLeft(accountList[0]);
	// console.log(`stableLeftToClaimFromFaucetfor account ${accountList[0]} is ${stableLeftToClaimFromFaucet}`);
	//NOTE BY MISTAKE IN THE DEX SC MIGRATION AND CONSTRUCTOR WE MUTIPLE BY 1 ether HENCE GETTTING TWICE AS BIG NUMBERS AS PLANNED
	//   const max_faucet_allowance  = web3.utils.toWei('100000');   MIGRATION
	// max_faucet_allowance = _max_faucet_allowance * 1 ether;       SC CONSTRUCTOR
	//SO WILL HAVE TO IMPOSE RESTRICTIONTS HERE IN JS BEFORE RE-DEPLOYING THE DEX SC
	const checkLeftFaucetAllowance = async (account) => {
		if (account)
		{
			console.log(`************ checkLeftFaucetAllowance account: `,account);
			setInput_Supply("");
			const stableLeftToClaimFromFaucet = await getFaucetMinted(account);
			setLeftFaucetAllowance(100000 - stableLeftToClaimFromFaucet);
		}
	};


	return(
		<>
			<div className="card" style={{color:"#9E38FF"}}>
				<div className="card-header d-sm-flex d-block pb-0 border-0">
					<div>
						<p className="fs-18">Maximum lifetime amount per account $100,000 aUSD (remaining {leftFaucetAllowance} aUSD)</p>
					</div>
					
				</div>
				<div className="card-body">
					<div className="basic-form">
						<form className="form-wrapper">
							<div className="form-group">
								<div className="input-group input-group-lg">
									<div className="input-group-prepend">
										<span className="input-group-text">Faucet</span>
									</div>
									<input type="text" value = {input_Supply } placeholder={leftFaucetAllowance} className="form-control" style={{color:"white"}} onChange={(event) => { 
										setInput_Supply(event.target.value);
									   }
									} />
								</div>
							</div>
							<div className="row mt-4 align-items-center">
								<div className="row pt-5 align-items-center">
									<div className="col-sm-3">
									</div>
									<div className="col-sm-6">
										<Link to={"#"} className="btn btn-primary d-block btn-lg rounded" style={{backgroundColor:"#4E0891"}}>
    				                    	<button className="btn-primary" style={{border: "none", backgroundColor:"#4E0891", color:"white"}} disabled = { swapWithExactSupply_IsSubmiting } onClick = { () => faucetMyAccount() }>CLAIM STABLE COIN aUSD</button> 
										</Link>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	)
}
export default QuickTrade;