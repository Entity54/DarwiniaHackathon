import React, { lazy, Suspense, useEffect, useState, useCallback } from 'react';

import { ethers } from 'ethers';  

//METAMASK
// import detectEthereumProvider from '@metamask/detect-provider'; // FOR METAMASK TO BE USED This function detects most providers injected at window.ethereum

// import ntt54_ERC20_raw from './Abis/ntt54_ERC20';      
import ntt54_Oracle_raw from './Abis/ntt54_Oracle';    //Address in Pangolin 0xdB0A4192d9b0130E2e5DB945380441DeE7099eDb

import {setup, getSCabstractions} from './Setup.js';
import {getAllData, getAccountBalance} from './ntt54Oracle.js';

/// Components
import Index from "./jsx";
/// Style
import "./vendor/bootstrap-select/dist/css/bootstrap-select.min.css";
import "./css/style.css";



function App (props) {

    const [setupSpecs,setSetupSpecs]            = useState({ wallet: null, provider: null, pair: null, connected: "Not connected", walletAddress: null });
    const [blockChainSpecs,setBlockChainSpecs]  = useState({ networkName: undefined, chainID: undefined, blockNumber: undefined, gasPrice: undefined});
    const [blockHeader, setBlockHeader]         = useState({ number: undefined , hash: undefined, size: undefined });
    const [oracleData,setOracleData] = useState({ _tickers: undefined, _tiks: undefined, timestamp: undefined, _prices: undefined, mcs: undefined, tokenAddresses: undefined, tickersStrings: undefined, tiksString: undefined, pricesBaseCur: undefined });
    const [oracleSC, setOracleSC]                = useState({ sc_ntt54_Oracle: undefined , singer_sc_ntt54_Oracle: undefined, address: undefined});

    const [evm_api_state,setEvm_Api_State] = useState(false);
    const [accountList, setAccountList] = useState();  //stores the list of accounts from the extensions
    const [accountBalance, setAccountBalance] = useState();
    const [portfolio, setPortfolio] = useState(undefined);

    const [blockTimestamp, setBlockTimestamp]   = useState(undefined);
    const [selectedAccountName, setSelectedAccountName] = useState("");

    //THESE ARE USED TO RESTRICT UPDATING PORTFOLIO BANALNCE TO ONCE EVERY portfolioUpdateBlockNumberFrequency BLOCKS INSTEAD OF EVERY BLOCK
    const [lastupdate_blocknumber, setLastupdate_blocknumber]   = useState(0);
    const [portfolioUpdateBlockNumberFrequency, setPortfolioUpdateBlockNumberFrequency]   = useState(20);

    

    const fetchOraclePrices = async (oracleSC) => {
      console.log(`fetchOraclePrices is RUN   xxxxxxxxx `);
      if (oracleSC)
      {
        const {_tickers, _tiks, timestamp, _prices, mcs, tokenAddresses, tickersStrings, tiksString, pricesBaseCur} = await getAllData(oracleSC);
        setOracleData( {_tickers, _tiks, timestamp, _prices, mcs, tokenAddresses, tickersStrings, tiksString, pricesBaseCur});
        console.log(`tickersStrings : `,tickersStrings[0],`  `,tickersStrings[1]);
      }
    }


  useEffect(() => {
        const runSetup = async () => {
          const { provider, wallet, account } = await setup("pangolin", true);

          setEvm_Api_State(true);
          setAccountList([account]);

          const balanceAccount_BigNumber = await provider.getBalance(account);
          const balanceAccount =  ethers.utils.formatUnits( balanceAccount_BigNumber, 18 );
          setAccountBalance(balanceAccount);
          const walletBalance = await wallet.getBalance(); // { BigNumber: "42" }
          const walletChainID = await wallet.getChainId(); //Pangolin 43  Returns the chain ID this wallet is connected to.  
          const gasPrice = await wallet.getGasPrice(); // 1000000000 Returns the current gas price. BigNumber   
          const nonce = await wallet.getTransactionCount(); //NONCE 
         
          console.log(`APP.JS  ***> account:${account} balanceAccount: ${balanceAccount} Wallet address that signs transactions: ${await wallet.getAddress()} walletBalance: ${ ethers.utils.formatUnits( walletBalance, 18 )} walletChainID: ${walletChainID} nonce:${nonce}`);
          console.log(`APP.JS  ***>  (await provider.getNetwork()).chainId: ${(await provider.getNetwork()).chainId} getBlockNumber: ${await provider.getBlockNumber()} gasPrice: ${gasPrice.toString()}`);
          // THIS (await provider.getNetwork()).name does not work

          // ntt54_ERC20 , ntt54_Oracle
          const ntt54_OracleSCAddress = "0x357C23877e32C6E01a7518F7e37d15aC338cdf0c";
          const sc_ntt54_Oracle =  new ethers.Contract(ntt54_OracleSCAddress, ntt54_Oracle_raw.abi, provider);
          const singer_sc_ntt54_Oracle = sc_ntt54_Oracle.connect(wallet);
          console.log(`APP.JS  ***>  sc_ntt54_Oracle Address : `,sc_ntt54_Oracle.address); 
          console.log(`APP.JS  ***>  singer_sc_ntt54_Oracle ***> `,singer_sc_ntt54_Oracle);
          
          const _setupSpecs = { wallet, provider, pair:"", connected: "Connected to Pangolin", walletAddress: await wallet.getAddress() };
          setSetupSpecs(_setupSpecs);
          setBlockChainSpecs({ networkName: "pangolin", chainID: (await provider.getNetwork()).chainId, blockNumber: await provider.getBlockNumber(), gasPrice: (await provider.getGasPrice()).toString() });
          // setBlockChainSpecs({ networkName: (await provider.getNetwork()).name, chainID: (await provider.getNetwork()).chainId, blockNumber: await provider.getBlockNumber(), gasPrice: (await provider.getGasPrice()).toString() });
          setOracleSC({sc_ntt54_Oracle, singer_sc_ntt54_Oracle, address: ntt54_OracleSCAddress})

          fetchOraclePrices(sc_ntt54_Oracle); 

          // setEvm_Api_State(true);
        }
        runSetup();
    
  }, []);   

   
  //on Oracle Update
  useEffect(async () => {
        
        if (blockHeader.number && (Number(blockHeader.number) - lastupdate_blocknumber) > portfolioUpdateBlockNumberFrequency)
        {
          console.log(`=====>  AN UPDATE OF PORTFOLIO BALANCES FOR ALL ERC20 FOR THE ACCOUNT WILL NOW RUN`);
          setLastupdate_blocknumber(Number(blockHeader.number));

          if (oracleData.tokenAddresses && accountList.length>0 && accountBalance && setupSpecs.provider) {
            const accountAllBalances = await getAccountBalance(oracleData, accountList[0], accountBalance,  setupSpecs.provider );
            // console.log(`accountAllBalances[0] : ${accountAllBalances[0].name} ${accountAllBalances[0].ticker} ${accountAllBalances[0].NumTokens} ${accountAllBalances[0].Value}`);
            // console.log(`accountAllBalances[1] : ${accountAllBalances[1].name} ${accountAllBalances[1].ticker} ${accountAllBalances[1].NumTokens} ${accountAllBalances[1].Value}`);
            setPortfolio(accountAllBalances);
          }
        }
        else 
        {
          const nextPortolfioUpdateBlockNumber = lastupdate_blocknumber + portfolioUpdateBlockNumberFrequency;
          console.log(`=====> lastupdate_blocknumber:${lastupdate_blocknumber} portfolioUpdateBlockNumberFrequency:${portfolioUpdateBlockNumberFrequency} blockHeader.number:${blockHeader.number} PORTFOLIO BALANCE WILL UPDATE at block #${nextPortolfioUpdateBlockNumber}.`);
        }

    }, [oracleData,blockHeader]);


  //#region  parachain events setup
  useEffect(() => {

    const parachain = async (provider) => {
        console.log(`App.js PANGOLIN Parachain is run at  Timestmap: ${new Date()}`);

        //Subscribe to the new headers on-chain.   
        provider.on("block", (blockNumber) => {
            console.log(`PANGOLIN PROVIDER EVENT block blockNumber: ${blockNumber}`);
            setBlockHeader({number: `${blockNumber}`, hash: `header.hash`, size: "header.size"});
            fetchOraclePrices( oracleSC.sc_ntt54_Oracle ); 

        });
    }

    if (setupSpecs.provider) 
    {
      parachain(setupSpecs.provider).catch((er) => { console.log(`APP.JS parachain Error: `,er);  });
    }
    else console.log(`App.js => setupSpecs.provider is undefined`);

  }, [setupSpecs.provider]);  
  //#endregion  parachain events setup


    
		return (
			<>
                <Suspense fallback={
                    <div id="preloader">
                        <div className="sk-three-bounce">
                            <div className="sk-child sk-bounce1"></div>
                            <div className="sk-child sk-bounce2"></div>
                            <div className="sk-child sk-bounce3"></div>
                        </div>
                    </div>  
                   }
                >
                    <Index setupSpecs={setupSpecs} oracleData={oracleData} portfolio={portfolio} evm_api_state={evm_api_state} 
                           blockChainSpecs={blockChainSpecs} blockHeader={blockHeader} blockTimestamp={blockTimestamp} 
                           accountList={accountList} selectedAccountName={selectedAccountName} />
                </Suspense>
            </>
        );
	
};


export default App;