'use strict';
const ntt54Oracle_Artifact = require('../../ntt54_Oracle_truffle/build/contracts/ntt54_Oracle.json');  
const {getWeb3, getSmartContractAbstraction} = require('./web3_setup.js');

let socket = {};                                                     
let setSocket = (frontEndSocket) => { socket = frontEndSocket; };    
let web3;
let ntt54Oracle_sc, ntt54Oracle_sc_address, administrator, priceReporter = null;
let oracleSpecs = { administrator, priceReporter, ntt54Oracle_sc_address, }
 

let init_project_Oracle = async (network) => {
    console.log(`ntt54Oracle_Artifact is initialised`);    
    web3 = await getWeb3(network);     

    const accounts = await web3.eth.getAccounts();
    console.log(`ntt54Oracle_Artifact => accounts: `,accounts);

    const {contractAbstraction, contractAddress} = await getSmartContractAbstraction(web3,ntt54Oracle_Artifact);
    ntt54Oracle_sc = contractAbstraction;
    ntt54Oracle_sc_address = contractAddress;
    oracleSpecs.ntt54Oracle_sc_address = contractAddress;
    console.log(`ntt54Oracle_Artifact => ntt54Oracle_sc_address: `,ntt54Oracle_sc_address);

    administrator = await ntt54Oracle_sc.methods.admin().call();
    oracleSpecs.administrator = administrator;
    console.log(`ntt54Oracle_sc => administrator: `,administrator);
    
    socket.emit('oracleSCspecs',{
        oraclSC_address : ntt54Oracle_sc_address,
        admin_address   : administrator,
        createdAt: new Date().getTime()
    });

    const admin_balance = await web3.eth.getBalance(administrator);
    socket.emit('updatedTickers',{
        gasUsed: "",    
        adminBalance: web3.utils.fromWei( admin_balance.toString() ),    
        createdAt: new Date().getTime()
    });
    

    //SETTING UP DEFAUTLS
    oracleSpecs.priceReporter = accounts[1];
    // await approvePriceReporter(accounts[1]);
    const priceReporterApproved = await isPriceReporter(accounts[1]);
    console.log(`accounts[1]: ${accounts[1]} priceReporterApproved: `,priceReporterApproved);

};



//CALLS
const isPriceReporter = async (priceReporterAddress) => {
    const approvedPriceReporter = await ntt54Oracle_sc.methods.priceReporters(priceReporterAddress).call();
    if (approvedPriceReporter) oracleSpecs.priceReporter = priceReporterAddress;

    socket.emit('isPriceReporter',{
        approvedPriceReporter,
        priceReporterAddress,
        createdAt: new Date().getTime()
    });

    return approvedPriceReporter;
}

const isTickerActive = async (ticker) => {
    if (ntt54Oracle_sc)
    {
        const activeTickerObj = await ntt54Oracle_sc.methods.activeTicker(web3.utils.utf8ToHex(ticker.toLowerCase())).call();
        console.log(`isTickerActive > for ${ticker} activeTickerObj: `,activeTickerObj);
        return activeTickerObj;
    }
    return null;
};

const getLastUpdateBlockNumber = async () => {
    if (ntt54Oracle_sc)
    {
        const Oracle_lastUpdateBlockNum = await ntt54Oracle_sc.methods.getLastUpdateBlockNum().call();
        console.log(`Oracle_lastUpdateBlockNum: `,Oracle_lastUpdateBlockNum);
        return Number(Oracle_lastUpdateBlockNum);
    }
    return 0;
};

const getTickers = async () => {
    if (ntt54Oracle_sc)
    {
        const _tickers = await ntt54Oracle_sc.methods.getTickers().call();
        const tickers = _tickers.map(item => web3.utils.hexToUtf8(item))

        socket.emit('getTickers',{
            tickers,
            createdAt: new Date().getTime()
        });

        return tickers;
    }
    return [];
};

const getDataforTicker = async (ticker) => {
    if (ntt54Oracle_sc)
    {
        const tickerData = await ntt54Oracle_sc.methods.getData(web3.utils.utf8ToHex( ticker.toLowerCase() )).call();
        // console.log(`tickerData tickerExists: ${tickerData["tickerExists"]} Timestamp: ${tickerData["timestamp"]} last_price: ${tickerData["last_price"]} marketCap: ${tickerData["marketCap"]} tokenAddress: ${tickerData["tokenAddress"]}`);

        socket.emit('getDataforTicker',{
            tickerExists: tickerData["tickerExists"],
            tik: web3.utils.hexToUtf8( tickerData["tik"] ),
            timestamp: tickerData["timestamp"],
            last_price: web3.utils.fromWei( tickerData["last_price"] ),   
            marketCap: tickerData["marketCap"],
            tokenAddress: tickerData["tokenAddress"],
            createdAt: new Date().getTime()
        });
    }
};

const getAllData = async (requestedTickers="") => {
    if (ntt54Oracle_sc)
    {
        const {"0":_tickers,"1":_tiks, "2":timestamp, "3":_prices, "4":mcs, "5":tokenAddresses } = await ntt54Oracle_sc.methods.getAllData().call();
        
        //convert prices from Wei
        const tickers = _tickers.map( item => web3.utils.hexToUtf8( item ) );
        const tiks = _tiks.map( item => web3.utils.hexToUtf8( item ) );
        const prices = _prices.map( prc => web3.utils.fromWei( prc ) );
        
        // console.log(`getAllData> tokenAddresses: `,tokenAddresses);
        console.log(`getAllData> tiks: `,tiks);


        if (requestedTickers!=="*")
        {
            socket.emit('getAllData',{
                tickers,
                tiks,
                timestamp,
                prices,
                mcs,
                tokenAddresses,
                requestedTickers,
                createdAt: new Date().getTime()
            });
        }
        else {
            socket.emit('quote_SC',{
                tickers,
                tiks,
                timestamp,
                prices,
                mcs,
                tokenAddresses,
                createdAt: new Date().getTime()
            });
        }

        return {_tickers, _tiks, timestamp, _prices, mcs, tokenAddresses, tickersStrings: tickers, tiksString: tiks, pricesBaseCur: prices};
    } else return null;
};


//SIGNED TRANSACTIONS
const approvePriceReporter = async (priceReporterAddress, approved=true) => {
    if (web3 && ntt54Oracle_sc && administrator)
    {
        console.log(`approvePriceReporter> priceReporterAddress: ${priceReporterAddress} administrator: ${administrator} approved:${approved}`);
        const gas = await ntt54Oracle_sc.methods.approvePriceReporter(priceReporterAddress, approved).estimateGas({from: administrator});
        const gasPrice = await web3.eth.getGasPrice();
        // console.log(`gas: ${gas} gasPrice: ${gasPrice}`);
    
        await ntt54Oracle_sc.methods.approvePriceReporter(priceReporterAddress, approved).send({from: administrator, gas: 2*gas, gasPrice })
                            .on('confirmation',async (confirmationNumber, receipt) =>  {
                                if (confirmationNumber === 1)
                                {
                                    if (approved) {
                                        oracleSpecs.priceReporter = priceReporterAddress;
                                    }
                                    console.log(`Transaction to update status approval to ${approved} for Price Reporter Address ${priceReporterAddress} has been mined confirmationNumber: ${confirmationNumber} gasUsed: ${receipt.gasUsed}`); 

                                    const admin_balance = await web3.eth.getBalance(administrator);

                                    socket.emit('approvePriceReporter',{
                                        priceReporter:  oracleSpecs.priceReporter,
                                        priceReporterAddress,
                                        status: approved,
                                        gasUsed: web3.utils.fromWei( receipt.gasUsed.toString() ),    
                                        adminBalance: web3.utils.fromWei( admin_balance.toString() ),    
                                        createdAt: new Date().getTime()
                                    });
                                }
                            });

    }
};
 

const updateTickers = async (_tickers, _tiks) => {
    const tickers = _tickers.map(item => web3.utils.utf8ToHex( item.toLowerCase() ) );
    const tiks    = _tiks.map(item => web3.utils.utf8ToHex( item.toLowerCase() ) );

    if (web3 && ntt54Oracle_sc && administrator)
    {
        console.log("Received _tickers: ",_tickers," _tiks: ",_tiks);
        const gas = await ntt54Oracle_sc.methods.updateTickers(tickers, tiks).estimateGas({from: administrator});
        const gasPrice = await web3.eth.getGasPrice();
        // console.log(`gas: ${gas} gasPrice: ${gasPrice}`);
    
        await ntt54Oracle_sc.methods.updateTickers(tickers, tiks).send({from: administrator, gas: 2*gas, gasPrice })
                            .on('confirmation',async (confirmationNumber, receipt) => {
                                if (confirmationNumber === 1)
                                {
                                    console.log(`Transaction to update tickers: `,tickers,` and tiks: `,tiks,` has been mined confirmationNumber: ${confirmationNumber} gasUsed: ${receipt.gasUsed}`);
                                    getTickers();

                                    const admin_balance = await web3.eth.getBalance(administrator);

                                    socket.emit('updatedTickers',{
                                        gasUsed: web3.utils.fromWei( receipt.gasUsed.toString() ),    
                                        adminBalance: web3.utils.fromWei( admin_balance.toString() ),    
                                        createdAt: new Date().getTime()
                                    });
                                }
                            });
    }
};

const updateTokenAddresses = async (_tickers, _addresses, _tickersIsStringArray=true) => {
    let tickers;
    if (_tickersIsStringArray) tickers = _tickers.map(item => web3.utils.utf8ToHex( item.toLowerCase() ) );
    else tickers = _tickers;

    if (web3 && ntt54Oracle_sc && administrator && _addresses.length>0 && _addresses.length===_tickers.length)
    {
        console.log("Received _tickers: ",_tickers," tickers: ",tickers,"  _addresses: ",_addresses);
        const gas = await ntt54Oracle_sc.methods.updateTokenAddresses(tickers,_addresses).estimateGas({from: administrator});
        const gasPrice = await web3.eth.getGasPrice();
        // console.log(`gas: ${gas} gasPrice: ${gasPrice}`);
    
        await ntt54Oracle_sc.methods.updateTokenAddresses(tickers,_addresses).send({from: administrator, gas: 2*gas, gasPrice })
                            .on('confirmation',async (confirmationNumber, receipt) => {
                                if (confirmationNumber === 1)
                                {
                                    console.log(`Transaction to update _addresses: `,_addresses,` for tickers`,tickers,` has been mined confirmationNumber: ${confirmationNumber} gasUsed: ${receipt.gasUsed}`);
                                    getTickers();

                                    const admin_balance = await web3.eth.getBalance(administrator);

                                    socket.emit('updatedTokenAddresses',{
                                        gasUsed: web3.utils.fromWei( receipt.gasUsed.toString() ),    
                                        adminBalance: web3.utils.fromWei( admin_balance.toString() ),    
                                        createdAt: new Date().getTime()
                                    });
                                }
                            });
    }
};


const removeTicker = async (_ticker) => {
    const ticker = web3.utils.utf8ToHex( _ticker.toLowerCase() );
    if (web3 && ntt54Oracle_sc && administrator)
    {
        const gas = await ntt54Oracle_sc.methods.removeTicker(ticker).estimateGas({from: administrator});
        const gasPrice = await web3.eth.getGasPrice();
        // console.log(`gas: ${gas} gasPrice: ${gasPrice}`);
    
        const suc = await ntt54Oracle_sc.methods.removeTicker(ticker).send({from: administrator, gas: 2*gas, gasPrice })
                            .on('confirmation',async (confirmationNumber, receipt) => {
                                    if (confirmationNumber === 1)
                                    {
                                        console.log(`Transaction to remove ticker: `,ticker,` has been mined confirmationNumber: ${confirmationNumber} gasUsed: ${receipt.gasUsed}`);
                                        getTickers();

                                        const admin_balance = await web3.eth.getBalance(administrator);

                                        socket.emit('tickerRemoved',{
                                            status: true,
                                            gasUsed: web3.utils.fromWei( receipt.gasUsed.toString() ),    
                                            adminBalance: web3.utils.fromWei( admin_balance.toString() ),    
                                            createdAt: new Date().getTime()
                                        });
                                    }
                            });
        
    }
};


const updateData = async (priceReporterAddress, _prices, mcs) => {

    if (web3 && ntt54Oracle_sc && priceReporterAddress)
    {
        const _tickers = await ntt54Oracle_sc.methods.getTickers().call();
        const nTickersEqualsnPrices = _tickers.length > 0 && _tickers.length === _prices.length && _tickers.length === mcs.length;
        const priceReporterApproved = await ntt54Oracle_sc.methods.priceReporters(priceReporterAddress).call();
        // console.log(`updateData > priceReporterAddress ${priceReporterAddress} approved: `,priceReporterApproved);
        if (!priceReporterApproved || !nTickersEqualsnPrices) {
            console.log(`An unauthorised Price Reporter ${priceReporterAddress} has tried to update prices OR tickers.lengthL${_tickers.length}!==${_prices.length}_prices.length!==${mcs.length}mcs.length. No transaction will be sent this time around`);
            return false;
        }

        //convert prices to Wei
        const prices = _prices.map( prc => web3.utils.toWei( prc.toString() ) );
        // console.log(`_prices: `,_prices,`   finished converting prices to WEI`);

        const gas = await ntt54Oracle_sc.methods.updateData(prices, mcs).estimateGas({from: priceReporterAddress}); //379453 gas
        const gasPrice = await web3.eth.getGasPrice();
        // console.log(`gas: ${gas} gasPrice: ${gasPrice}`);
    
        await ntt54Oracle_sc.methods.updateData(prices, mcs).send({from: priceReporterAddress, gas: gas, gasPrice })
                            .on('confirmation',async (confirmationNumber, receipt) => {
                                if (confirmationNumber === 1)
                                {
                                    console.log(`Transaction to update prices: ,prices, and mcs: ,mcs, has been mined confirmationNumber: ${confirmationNumber} gasUsed: ${receipt.gasUsed}`);
                                    getAllData("*");

                                    const priceReporter_balance = await web3.eth.getBalance(priceReporterAddress);

                                    socket.emit('showGasUsed',{
                                        gasUsed: web3.utils.fromWei( receipt.gasUsed.toString() ),    
                                        priceReporterBalance: web3.utils.fromWei( priceReporter_balance.toString() ),    
                                        createdAt: new Date().getTime()
                                    });
                                }
                            }); 
        
        // const txReceipt = await ntt54Oracle_sc.methods.updateData(prices, mcs).send({from: priceReporterAddress, gas: gas, gasPrice });
        // console.log(`txReceipt: `,txReceipt);
        // ntt54Oracle_sc.methods.updateData(prices, mcs).send({from: priceReporterAddress, gas: gas, gasPrice })
        // .then( msgSuccess => console.log(`msgSuccess: `,msgSuccess))
        // .catch( er => console.log(`Error in updateData: `,er) );

        return true;
    } else {
        console.log(`Tried to run updateData for Oracle but one of web3, ntt54Oracle_sc, priceReporterAddress is undefined priceReporterAddress: ${priceReporterAddress}`);
        return false;
    };
};



//Only for testing purposes requires _setLastUpdateBlockNum to be public
// const increaselastUpdateBlockNumber = async (blockNum) => {
//     if (web3 && ntt54Oracle_sc)
//     {
//         console.log(`increaselastUpdateBlockNumber> blockNum: ${blockNum}`);
//         const gas = await ntt54Oracle_sc.methods._setLastUpdateBlockNum(blockNum).estimateGas({from: administrator});
//         const gasPrice = await web3.eth.getGasPrice();
//         console.log(`gas: ${gas} gasPrice: ${gasPrice}`);
    
//         await ntt54Oracle_sc.methods._setLastUpdateBlockNum(blockNum).send({from: administrator, gas: gas, gasPrice })
//                             .on('confirmation',(confirmationNumber, receipt) =>  {
//                                 if (confirmationNumber === 1)
//                                 {
//                                     console.log(`Transaction to increaselastUpdateBlockNumber has been mined confirmationNumber: ${confirmationNumber} gasUsed: ${receipt.gasUsed}`); 
//                                 }
//                             });
//     }
// };





module.exports = {
                    setSocket,
                    init_project_Oracle,
                    isPriceReporter,
                    isTickerActive,
                    getLastUpdateBlockNumber,
                    getTickers,
                    getDataforTicker,
                    getAllData,

                    oracleSpecs,    

                    approvePriceReporter,
                    updateTickers,
                    updateTokenAddresses,
                    removeTicker,
                    updateData,

                    // increaselastUpdateBlockNumber,
                 }
