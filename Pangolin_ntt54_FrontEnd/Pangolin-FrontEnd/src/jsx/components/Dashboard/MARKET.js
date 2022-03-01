import React, { useState, useRef, useEffect } from "react";
import {  Sparklines, SparklinesLine } from 'react-sparklines';


//TODO sparkPriceArray
const sampleData1 = [2,2,2,4,4,5,4,6,5,7,6,8,7,9,8,4,7,6,8,7];
const sampleData2 = [2,3,4,5,6,5,4,6,5,7,2,3,4,5,3,2,5,4,5,7];
const sampleData3 = [2,2,4,3,2,4,3,3,4,2,1,3,2,4,2,3,5,4,3,2];
const sampleData4 = [6,2,3,2,3,5,3,3,7,2,4,7,5,1,3,6,5,9];
const sampleData5 = [6,2,3,2,3,5,4,3,2,2,4,5,2,5,5,4,3,1,3,4,5,6];
const sampleData6 = [1,2,3,1,4,2,4,2,2,1,2,5,1,4,1,1,5,4,3,2,4,2];
const sampleData7 = [2,3,4,5,6,5,4,6,5,7,2,3,4,5,3,2,5,4,5,7];
const sampleData8 = [2,2,2,4,4,5,4,6,5,7,6,8,7,9,8,4,7,6,8,7];
const sampleData9 = [1,2,3,1,4,2,4,2,2,1,2,5,1,4,1,1,5,4,3,2,4,2];
 
const MarketCapital = ({ blockHeader, oracleData, sparkPriceArray, oraclePrices, total_CoinSupply }) => {
	const [data, setData] = useState(document.querySelectorAll("#marketCapital tbody tr"));
	const sort = 9;
	const activePag = useRef(0);
	const [test, settest] = useState(0);

	const [oracleDataList, setOracleDataList] = useState(null);


  // Active data
	const chageData = (frist, sec) => {
		for (var i = 0; i < data.length; ++i) {
			if (i >= frist && i < sec) {
				data[i].classList.remove("d-none");
			} else {
				data[i].classList.add("d-none");
			}
		}
	};


	const getsparkData = (index) => {
		let dataArray;
		switch (index%9) {
			case 1:
				dataArray = sampleData1;
				break;
			case 2:
				dataArray = sampleData2;
				break;
			case 3:
				dataArray = sampleData3;
				break;
			case 4:
				dataArray = sampleData4;
				break;
			case 5:
				dataArray = sampleData5;
				break;
			case 6:
				dataArray = sampleData6;
				break;
			case 7:
				dataArray = sampleData7;
				break;
			case 8:
				dataArray = sampleData8;
				break;
			case 0:
				dataArray = sampleData9;
				break;
		}
		return dataArray;
	}

    
	//ORACLE DATA
	const refreshData = (_oracleData) =>{
	
		if (_oracleData.tickersStrings)
		{
			const numOfData = _oracleData.tickersStrings.length;
			console.log(`MARKET numOfData: ${numOfData}`)
			return _oracleData.tickersStrings.map((ticker, index) => {
				return (
					<tr key={index} role="row" className={index%2 === 0? "even" : "odd"}> 
						<td className="sorting_1"><span className="rank-ic fs-20">#{index+1}</span></td>
						<td>{_oracleData.tickersStrings[index]}</td>
						<td>{_oracleData.tiksString[index]}</td>
						<td>{_oracleData.pricesBaseCur[index]}</td>
						<td>{_oracleData.mcs[index]}</td>
						<td>{_oracleData.tokenAddresses[index]}</td>
						<td>{ new Date(1000 * Number( _oracleData.timestamp[index] )).toISOString() }</td>
						<td>
							<svg className="peity-line" width="280" height="50" >
								<Sparklines data={getsparkData(index)}>
									<SparklinesLine style={{ strokeWidth: 4, stroke: "#2258bf", fill: "none" }}  />
								</Sparklines>		
							</svg>
						</td>
					</tr>
				)

			});

		}
		else return <tr><td>Loading data...</td></tr>

	}
		
	useEffect(() => {
		console.log(`Running useEffect for Oracle Data`);
		setOracleDataList( refreshData(oracleData) );
	}, [oracleData]);

	useEffect(() => {
		setData(document.querySelectorAll("#marketCapital tbody tr"));
	}, [test]);

  // Active pagginarion
	activePag.current === 0 && chageData(0, sort);
	// paggination
	let paggination = Array(Math.ceil(data.length / sort))
		.fill()
		.map((_, i) => i + 1);

  // Active paggination & chage data
	const onClick = (i) => {
		activePag.current = i;
		chageData(activePag.current * sort, (activePag.current + 1) * sort);
		settest(i);
	};
	
	
  return (
    <>
		<div className="row">
			<div className="col-xl-12">
				<div className="table-responsive table-hover fs-14 " style={{backgroundColor:"", height:"75vh"}}>
					<div id="example6_wrapper" className="dataTables_wrapper no-footer">
						<table className="table display  mb-4 dataTablesCard font-w600  market-tbl  border-no  text-black no-footer border-0" 
							id="marketCapital" role="grid" aria-describedby="example6_info" style={{backgroundColor:"", margin:"10px", width:"99%"}}> 
							<thead>
								<tr role="row">
									<th className="sorting_asc" tabIndex={0}  rowSpan={1} colSpan={1}>Rank</th>
									<th className="sorting" tabIndex={0}  rowSpan={1} colSpan={1}>ID</th>
									<th className="sorting" tabIndex={0}  rowSpan={1} colSpan={1}>Ticker</th>
									<th className="sorting" tabIndex={0}  rowSpan={1} colSpan={1}>Price</th>
									<th className="sorting" tabIndex={0}  rowSpan={1} colSpan={1}>Market Cap</th>
									<th className="sorting" tabIndex={0}  rowSpan={1} colSpan={1}>Address</th>
									<th className="sorting" tabIndex={0}  rowSpan={1} colSpan={1}>Timestamp</th>
									<th className="sorting" tabIndex={0}  rowSpan={1} colSpan={1}>Graph</th>
							   </tr>
							</thead>
							<tbody>
								{oracleDataList}
							</tbody>
						</table>
						<div className="d-sm-flex text-center justify-content-between align-items-center mt-3">
							<div className="dataTables_info">
								  Showing {activePag.current * sort + 1} to{" "}
								  {data.length > (activePag.current + 1) * sort
									? (activePag.current + 1) * sort
									: data.length}{" "}
								  of {data.length} entries
							</div>
							<div className="dataTables_paginate paging_simple_numbers" id="example5_paginate">
								<span className="paginate_button previous disabled" to="">
									Previous
								</span>
								  <span> 
									{paggination.map((number, i) => (
										<span key={i} to="/market-capital" onClick={onClick(i)} className={`paginate_button  ${ activePag.current === i ? "current" : "" } `}  
											style={{ display: "inline-block" }}>{number}
										</span>
									))}
								  </span>
								<span className="paginate_button next" to="">
									Next
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
    </>
  );
};

export default MarketCapital;
