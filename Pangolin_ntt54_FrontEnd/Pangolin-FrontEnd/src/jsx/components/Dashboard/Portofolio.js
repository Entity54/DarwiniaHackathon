import React,{useState,useEffect,useContext} from 'react';

import { ThemeContext } from "../../../context/ThemeContext";
import Donut from "../Boltz/MyWallet/Donut";
import QuickTransfer from '../Boltz/Home/ntt54_QuickTransfer';


const Portofolio = ({ setupSpecs, portfolio, blockHeader, accountList }) =>{
	const { background } = useContext(ThemeContext);
	const [myPortfolio, setMyPortfolio] = useState(null);
	const [totalPortfolioValue, setTotalPortfolioValue] = useState(null);

	const refreshData = (_portfolio) =>{
	
		if (_portfolio)
		{
			// const numOfData = _portfolio.length;
			// console.log(`PORTFOLIO numOfData: ${numOfData}`)
			let sum = 0;
			_portfolio.forEach(item => sum += Number(item.Value) );
			setTotalPortfolioValue(sum);

			return _portfolio.map((token, index) => {
				return (
					<div key={index} className="bg-gradient-1 coin-holding flex-wrap" style={{height:"70px", marginBottom:"15px", backgroundColor:""}}>
						<div className="col-xl-3 col-xxl-3">

							<div className="mb-2">
								<div className="d-flex align-items-center">
									<div className="ms-3">
										<p className="mb-0 op-6" >{token.name}</p>
									</div>
								</div>
							</div>
						</div>
						<div className="col-xl-3 col-xxl-3">

							<div className="mb-2">
								<div className="d-flex align-items-center">
									<div className="ms-3">
										<p className="mb-0 op-6">{token.ticker}</p>
									</div>
								</div>
							</div>
						</div>
						<div className="col-xl-3 col-xxl-3">

							<div className="mb-2">
								<div className="d-flex align-items-center">
									<div className="ms-3">
										<p className="mb-0 op-6">{token.NumTokens}</p>
									</div>
								</div>
							</div>
						</div>
						<div className="col-xl-3 col-xxl-3">

							<div className="mb-2">
								<div className="d-flex align-items-center">
									<p className="mb-0 ms-2 font-w400 text-black">${token.Value}</p>	
								</div>
							</div>
						</div>
					</div>
				)

			});

		}
		else return <tr><td>Loading data...</td></tr>

	}

	useEffect(() => {
		// console.log(`Running useEffect for MyPortoflio`);
		setMyPortfolio( refreshData(portfolio) );
	}, [portfolio]);


	return(
		<>
			<div className="mb-sm-5 mb-3 d-flex flex-wrap align-items-center text-head">
				<h2 className="font-w600 mb-2 me-auto">Portfolio</h2>
			</div>
			<div className="row">
				<div className="col-xl-6 col-xxl-8">

					<div className="card">
						<div className="card-header border-0 pb-0">
							<h4 className="mb-0 fs-20 text-black">Total Value ${totalPortfolioValue?totalPortfolioValue:0}</h4>
						</div>

						<div className="card-body" style={{overflowY: "scroll", height:"400px"}}>
							{myPortfolio}
						</div>
					</div>

				</div>

				<div className="col-xl-6 col-xxl-12">
						<QuickTransfer setupSpecs={setupSpecs} portfolio={portfolio} blockHeader={blockHeader}/>
				</div>
			</div>	
		</>
	)
}
export default Portofolio; 