import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {Dropdown} from 'react-bootstrap';
import { getAllData, setWallet, getBalance, getStableBalance, getPrice, swapStableForToken, swapTokenForStable, faucet, checkAllowanceOfStabletoDEX, checkAllowanceOfTokentoDEX } from '../../../../ntt54Dex.js';         


const QuickTrade = ({setupSpecs, portfolio, oracleData, accountList }) => {
	
	const [tokenDropDowns, setTokenDropDowns] = useState(null);
	const [baseCurrency, setBaseCurrency] = useState("BTC");	
	const [baseCurrencyIconIndex, setBaseCurrencyIconIndex] = useState(0);	
	const [dexArray, setDexArray] = useState([]);	
	const [swapQuote, setSwapQuote] = useState(0);	 //0 for stable 1 for token
	const [tokenQtyInputState, setTokenQtyInputState] = useState(true);	 //if false then the input is not disabled, hence active
    const [expectedToreceiveFromSwap, setExpectedToreceiveFromSwap] = useState("");
	const [tokenCurrency, setTokenCurrency] = useState("BTC");	
    const [swapWithExactSupply_IsSubmiting, setSwapWithExactSupply_IsSubmiting] = useState(false);
    const [input_Supply, setInput_Supply] = useState("");
    const [accountMaxSupply, setAccountMaxSupply] = useState("");


	const _swapWithExactSupply = async () => {
		console.log(`SWAP WITH EXACT SUPPLY HAS BEEN TRIGERRED HURRAH`)
		setSwapWithExactSupply_IsSubmiting(true);
		if (baseCurrency.toLowerCase()==='ausd')
		{
            console.log(`WE WILL SWAP STABLE FOR TOKEN ${dexArray[baseCurrencyIconIndex].ticker}   ${dexArray[baseCurrencyIconIndex]._ticker} address:${dexArray[baseCurrencyIconIndex].tokenAddress}  ${input_Supply} ${accountMaxSupply}`);
			swapStableForToken( dexArray[baseCurrencyIconIndex]._ticker , `${Math.min(Number(accountMaxSupply),Number(input_Supply))}` )
			.then( resMsg => {
				console.log(`swapStableForToken resMsg: `,resMsg)
			    setExpectedToreceiveFromSwap(`Received: ${resMsg}`);
				setSwapWithExactSupply_IsSubmiting(false);
			})
			.catch( er => {
				console.log(er); 
				setSwapWithExactSupply_IsSubmiting(false);
			});  
			 
		}
		else  //SWAP TOKEN FOR STABLE
		{
			console.log(`WE WILL SWAP TOKEN FOR STABLE ${dexArray[baseCurrencyIconIndex].ticker}   ${dexArray[baseCurrencyIconIndex]._ticker}  ${input_Supply} ${accountMaxSupply}`);
			swapTokenForStable( dexArray[baseCurrencyIconIndex].tokenAddress, dexArray[baseCurrencyIconIndex]._ticker , `${Math.min(Number(accountMaxSupply),Number(input_Supply))}` )  
			.then( resMsg => {
				console.log(`swapTokenForStable resMsg: `,resMsg)
			    setExpectedToreceiveFromSwap(`Received: ${resMsg}`);
				setSwapWithExactSupply_IsSubmiting(false);
			})
			.catch( er => {
				console.log(er); 
				setSwapWithExactSupply_IsSubmiting(false);
			});  

		}
	};

	 
	useEffect( async () => {
	    if (swapQuote===0) 
		{
			setBaseCurrency("aUSD");
			setTokenQtyInputState(true);
		}
		else{
			setBaseCurrency("BTC");
			setTokenQtyInputState(false);
		}
	}, [swapQuote]);

	const refreshData = (_portfolio) =>{
		if (_portfolio)
		{
			return _portfolio.map((token, index) => {
				return (

					<Dropdown.Item key={index} onClick={() => { 
						// console.log(`index:$ token.ticker : `,token.ticker);
						if (swapQuote===1) setBaseCurrency(token.ticker);
						// setBaseCurrency(token.ticker);
						setTokenCurrency(token.ticker);
						setBaseCurrencyIconIndex(index);
					} }>{token.ticker}</Dropdown.Item>
				)
			});
		}
		else return <>Loading data...</> 
	}

	useEffect( async () => {
		if (setupSpecs.wallet)
		{
			setWallet(setupSpecs.wallet);
			const _portfolio = await getAllData();
			setDexArray(_portfolio);
			setTokenDropDowns( refreshData(_portfolio) );
		}
	}, [setupSpecs]);

	useEffect(async () => {
			console.log(`Running useEffect for ntt54_QuickTrade`);
			const _portfolio = await getAllData();
			setDexArray(_portfolio);
			setTokenDropDowns( refreshData(_portfolio) );
	}, [baseCurrencyIconIndex]);


	useEffect(async () => {
        console.log(`GET BALANCE FOR THIS TOKEN`);
		if(setupSpecs.wallet)
		{
			if (baseCurrency.toLowerCase()==='ausd' && dexArray && dexArray.length>0)
			{
				console.log("STABLECOING  BALANCE");
				const balance = await getStableBalance(accountList[0]);
				setInput_Supply(balance);
				setAccountMaxSupply(balance);
					 
			    const price = await getPrice(dexArray[baseCurrencyIconIndex]._ticker);
			    console.log(`PRICE IS FOR INDEX ${baseCurrencyIconIndex}`,price);
				setExpectedToreceiveFromSwap(price!=="0"? (Number(balance) / Number(price)).toFixed(5) : "" );
			}
			else if (dexArray && dexArray.length>0)
			{
				console.log(`BASE CURRENCY `,dexArray[baseCurrencyIconIndex]);
				const balance = await getBalance(dexArray[baseCurrencyIconIndex].tokenAddress, accountList[0]);
				setInput_Supply(balance);
				setAccountMaxSupply(balance);

				const price = await getPrice(dexArray[baseCurrencyIconIndex]._ticker);
			    console.log(`PRICE IS FOR INDEX ${baseCurrencyIconIndex}`,price,` AND REVERSE IS : `,price==="0"?"":1/Number(price));
				setExpectedToreceiveFromSwap(balance!=="0"? (Number(balance) * Number(price)).toFixed(5) : "" );

			}
		}
	},[baseCurrency,setupSpecs,tokenCurrency,dexArray]);


	const tokenDiv =   (
							<div className="form-group">
								<div className="input-group input-group-lg">
									<div className="input-group-prepend">
										<Dropdown>
											<Dropdown.Toggle variant="" as="div" className="input-group-text form-control style-2 default-select cursor-pointer">{tokenCurrency} </Dropdown.Toggle>
											<Dropdown.Menu style={{height:"500px", overflowY: "scroll"}} >
												{tokenDropDowns}
											</Dropdown.Menu>
										
										</Dropdown>
									</div>
									<input type="text" className="form-control" disabled={tokenQtyInputState} placeholder={swapQuote===1? "":expectedToreceiveFromSwap} value = {swapQuote===1? input_Supply : "" } style={{color:"white"}}  onChange = { (event) => { 
										if (swapQuote===1) setInput_Supply(event.target.value); 
									}
									} />
								</div>
							</div>
						);
	const stableDiv =   (			
							<div className="form-group" style={{marginTop:"10px"}}>
								<div className="input-group input-group-lg">
									<div className="input-group-prepend">
										<div className="input-group-prepend">
											<span className="input-group-text">aUSD</span>
										</div>
									</div>
									<input type="text" disabled={!tokenQtyInputState}  value = {swapQuote===0? input_Supply : "" } placeholder={swapQuote===0?"":expectedToreceiveFromSwap} className="form-control" style={{color:"white"}} onChange={(event) => { 
										setInput_Supply(event.target.value);
									   }
									} />
								</div>
							</div>
						)


	return(
		<>
			<div className="card">
				<div className="card-header d-sm-flex d-block pb-0 border-0">
					<div>
						<h4 className="fs-20 text-black">Swap</h4>
					</div>
				</div>
				<div className="card-body">
					<div className="basic-form">
						<form className="form-wrapper">
								{ swapQuote===0? stableDiv : tokenDiv }
							<div className="row" style={{marginTop:"10px", marginBottom:"10px", backgroundColor:""}}> 
									<div className="col-xl-5 col-xxl-12" style={{backgroundColor:""}}></div>
									<div className="col-xl-2 col-xxl-12" style={{backgroundColor:"", textAlign:"center"}} onClick={() => swapQuote===0? setSwapQuote(1) : setSwapQuote(0)} ><i className="bi bi-arrow-down-up" style={{fontSize:"24px"}}></i></div>
									<div className="col-xl-5 col-xxl-12" style={{backgroundColor:""}}></div>
							</div>
								{ swapQuote===0? tokenDiv : stableDiv }

							<div className="row mt-4 align-items-center"  style={{backgroundColor:"",  }}>
									<div className="col-sm-3"   >
									</div>
									<div className="col-sm-6"  style={{marginTop:"20px"}}>
										<Link to={"#"} className="btn btn-primary d-block btn-lg rounded">
    				                    	<button className="btn-primary" disabled = { swapWithExactSupply_IsSubmiting } onClick = { _swapWithExactSupply } style={{border: "none"}}>SWAP</button> 
										</Link>
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