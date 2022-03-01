import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import TestimonialOwl from './TestimonialOwl';
import {Dropdown} from 'react-bootstrap';
// import {decimals, transfer_Balance, transfer_Currency } from '../../../../AMTC6_API.js';         

// import {EVM_Setup, oracle_EVM_PricesHuman, oracle_EVM_Icons, oracle_EVM_Description} from '../../../../Predeployed_EVM.js';     //Blockchain provider,signer setup and helper functions
import {getAllData, getAccountBalance, transfer_nativeToken, transfer_ERC20} from '../../../../ntt54Oracle.js';

 
const QuickTransfer = ({setupSpecs, portfolio, icons, tickSymbols, blockHeader, customerPortfolio}) => {

	const [tokenDropDowns, setTokenDropDowns] = useState(null);
	const [baseCurrency, setBaseCurrency] = useState("PRING");	
	const [baseCurrencyIconIndex, setBaseCurrencyIconIndex] = useState(0);	
    const [inputTranferAmount, setInputTranferAmount] = useState("");
	const [baseCurrencyPlaceHolder, setBaseCurrencyPlaceHolder] = useState("");	

	const [sendToAddress, setSendToAddress] = useState("");	

    const [transfer_IsSubmiting, setTransfer_IsSubmiting] = useState(false);
    const [transactionMessage, setTransactionMessage] = useState("...........");


	// const [swapTech, setSwapTech] = useState("API");
	// const [placeholderText, setPlaceholderText] = useState("Substrate Address");	

	const provideAddressToSendCoins = (adr) => {
		setSendToAddress(adr);
	};


	const settingBaseCurrency = (tokSymbl) => {
		setBaseCurrency(tokSymbl);
		// const tok_indx =  tickSymbols.findIndex((tok) => tok.toLowerCase()===tokSymbl.toLowerCase());
		// setBaseCurrencyIconIndex(tok_indx);
		// if (tokSymbl!=="ACA" && tokSymbl!=="DOT") { setInputTranferAmount(""); setBaseCurrencyPlaceHolder("currently only ACA,DOT and XBTC are supported"); }
		// else if (customerPortfolio) setInputTranferAmount(customerPortfolio[tokSymbl]);
	};


	const transferBalance = async () => {
		console.log(`QuickTransfer transferBalance baseCurrency: `,baseCurrency,` sendToAddress: `,sendToAddress,`  inputTranferAmount: `,inputTranferAmount);
		// const [setupSpecs,setSetupSpecs]            = useState({ wallet: null, provider: null, pair: null, connected: "Not connected", walletAddress: null });
    	const amount = inputTranferAmount.toString();
        
        if (setupSpecs.wallet && amount!=="0" && sendToAddress!=="")
		{
			setTransfer_IsSubmiting(true);
			setTransactionMessage(`Transfer transaction submitted at BlockNumber: ${blockHeader.number}`);

			if ( baseCurrency==='PRING' )
			{
				const receipt = await transfer_nativeToken(setupSpecs.wallet, amount, sendToAddress);
				
				//THE TRANSFER IS DONE BUT CANNOT PICK THE EVENTS BELOW 
				// receipt.wait().then( resolveMsg => {
				// 		console.log(`ntt54_QuickTransfer Native Curency Transfer The transaction is mined now txReceipt: `,resolveMsg);

				// })
				// .catch(er => {
				// 	console.log("ntt54_QuickTransfer Native Curency Transfer Currency has thrown the folowing errro: ",er);
					
		  		// });

				// (setupSpecs.provider).waitForTransaction(receipt.hash, 1, 150000)
				// .then((txReceipt) => {
				// 	   console.log(`ntt54_QuickTransfer Native Curency Transfer The transaction is mined now txReceipt: `,txReceipt);

				// })
				// .catch(er => {
				// 		  console.log("ntt54_QuickTransfer Native Curency Transfer Currency has thrown the folowing errro: ",er);
						  
				// });
				 
				 
				setTransfer_IsSubmiting(false);
				setInputTranferAmount("");
			}
			else 
			{
				// const result = await transfer_Currency(inputTranferAmount, baseCurrency, sendToAddress);
				console.log(`ntt54_QuickTranfer transferBalance for ${baseCurrency} with tokenAddress: ${portfolio[baseCurrencyIconIndex].tokenAddress}`);
				const receipt = await transfer_ERC20(setupSpecs.wallet, portfolio[baseCurrencyIconIndex].tokenAddress, amount, sendToAddress);
				
			    receipt.wait().then( resolveMsg => {
						console.log(`ntt54_QuickTransfer ERC20 Transfer The transaction is mined now txReceipt: `,resolveMsg);
				})
				.catch(er => {
					console.log("ntt54_QuickTransfer ERC20 Transfer has thrown the folowing errro: ",er);
		  		});

				setTransfer_IsSubmiting(false);
				setInputTranferAmount("");
			}
		}

	};

	useEffect(() => {
		if (portfolio) setBaseCurrencyPlaceHolder(portfolio[baseCurrencyIconIndex].NumTokens);
		else setBaseCurrencyPlaceHolder("");
	},[baseCurrency,portfolio]);


	const refreshData = (_portfolio) =>{
		if (_portfolio)
		{
			return _portfolio.map((token, index) => {
				return (

					<Dropdown.Item key={index} onClick={() => { 
						settingBaseCurrency(token.ticker);
						setBaseCurrencyIconIndex(index);

					} }>{token.ticker}</Dropdown.Item>

				)

			});

		}
		else return <>Loading data...</> 

	}


	useEffect(() => {
		console.log(`Running useEffect for ntt54_QuickTransfer`);
		setTokenDropDowns( refreshData(portfolio) );
	}, [portfolio]);













	return(
		<>
			<div className="card">
				<div className="card-header d-sm-flex d-block pb-0 border-0">
					<div>
						<h4 className="fs-20 text-black">Transfer</h4>
					</div>
					<div  onClick = {() => setInputTranferAmount(baseCurrencyPlaceHolder)}>
						<span className="fs-20" style={{color:"#a7adba"}}>{baseCurrencyPlaceHolder===""?"":`Max: ${baseCurrencyPlaceHolder}`}</span>
					</div>
					
					{/* <Dropdown className="quick-select">
						<Dropdown.Toggle variant="" as="div" className="form-control style-2 default-select cursor-pointer">{swapTech} </Dropdown.Toggle>
						<Dropdown.Menu >
							<Dropdown.Item onClick={() => { setSwapTech("EVM"); setPlaceholderText("EVM Address") }}>EVM</Dropdown.Item>
							<Dropdown.Item onClick={() => { setSwapTech("API"); setPlaceholderText("Substrate Address") }}>API</Dropdown.Item>
						 </Dropdown.Menu>
					</Dropdown> */}
				</div>
				
				<div className="card-body">
					<div className="form-wrapper">
						<div className="form-group">
							<div className="input-group input-group-lg">
								<div className="input-group-prepend">
									<Dropdown>
											{/* <Dropdown.Toggle variant="" as="div" className="input-group-text form-control style-2 default-select cursor-pointer"><img alt="images" width={50} src={icons[baseCurrencyIconIndex]} style={{ marginRight: "25px" }}/>{baseCurrency} </Dropdown.Toggle> */}
											<Dropdown.Toggle variant="" as="div" className="input-group-text form-control style-2 default-select cursor-pointer">{baseCurrency} </Dropdown.Toggle>
											<Dropdown.Menu style={{height:"500px", overflowY: "scroll"}} >
												{tokenDropDowns}
												{/* <Dropdown.Item onClick={() => settingBaseCurrency("ACA")}>ACA</Dropdown.Item>*/}
											</Dropdown.Menu>
									</Dropdown>
								</div>
								<input type="number" step="0.01" className="form-control"  value={inputTranferAmount}  placeholder={baseCurrencyPlaceHolder===""?"":`Balance: ${baseCurrencyPlaceHolder}`} onChange = {(event) => setInputTranferAmount( Math.min( Number(baseCurrencyPlaceHolder) , Number(event.target.value) ) )} style={{color:"white"}} />
								{/* <input type="number" min="1" max="10" step="0.01" className="form-control" value={inputTranferAmount} placeholder={inputTranferAmount===""?"":`Balance: ${inputTranferAmount}`} onChange = {(event) => setInputTranferAmount(event.target.value)} style={{color:"white"}} /> */}

							</div>
						</div>
						<div className="form-group">
								<div className="input-group input-group-lg">
									<div className="input-group-prepend">
										<span className="input-group-text">send to Address</span>
									</div>
									<input type="text" className="form-control" value={sendToAddress} placeholder={"DVM Address"} onChange = {(event) => setSendToAddress(event.target.value)} style={{fontSize: "18px", color: "white"}} />
								</div>
							</div>
					</div>

					<br/>
					<span style={{fontSize:18, color:"green"}}>{transactionMessage}</span>
					<br/>
					<br/>

					<div className="d-flex mb-3 justify-content-between align-items-center view-link">
						<h4 className="text-black fs-20 mb-0">Recent Addresses</h4>
					</div>
					
					<TestimonialOwl provideAddressToSendCoins={provideAddressToSendCoins} />
					
					<div className="row pt-5 align-items-center">
						<div className="col-sm-3">
						</div>

						<div className="col-sm-6">
							<Link to={"#"} className="btn btn-primary d-block btn-lg rounded" style={{backgroundColor: "#DE9C06"}}>
    				            <button className="btn-primary" disabled={transfer_IsSubmiting} onClick = {transferBalance} style={{border: "none", backgroundColor: "#DE9C06"}}>TRANSFER</button> 
							</Link>
						</div>
					</div>
				</div>
			</div>
		
		</>
	)
}
export default QuickTransfer;