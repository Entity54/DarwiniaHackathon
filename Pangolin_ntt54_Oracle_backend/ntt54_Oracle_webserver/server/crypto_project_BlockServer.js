'use strict';
require('dotenv').config();
const {getWeb3, _ } = require('./web3_setup.js');
const crypto_project_Oracle = require('./crypto_project_Oracle.js');
const retrieveData  = require('./retrieveData.js');   

let updateFrequencyInBlocks = 10;
let lastUpdate_block_number = 0, nextUpdate_block_number=0;
let socket = {};                                                     
const setSocket = (frontEndSocket) => { socket = frontEndSocket; };    
const setInitialConditions = ()  => { lastUpdate_block_number = 0; nextUpdate_block_number=0; }
const set_updateFrequencyInBlocks = num => updateFrequencyInBlocks = num;
const state_CryptoServer = { state: "available", nextUpdate_block_number: 0, blockNum: 0 };   //available, updating
 

//#region *** CRYPTO NETWORK WEB SOCKET  ****
let init_CryptoServer = (network) => {
    console.log(`init_CryptoServer is initialised for network: ${network} updateFrequencyInBlocks: ${updateFrequencyInBlocks}`);
    let web3 = getWeb3(`${network}_socket`);  

    console.log(`Subscribing to Blockchain Blocks for network:${network} ...`);
    web3.eth.subscribe('newBlockHeaders')
    .on('data', async block => {
        const oracle_lastUpdate_block_number = await crypto_project_Oracle.getLastUpdateBlockNumber();
        nextUpdate_block_number = oracle_lastUpdate_block_number + updateFrequencyInBlocks;  //only used for showing to front end
        state_CryptoServer.nextUpdate_block_number = nextUpdate_block_number;
        state_CryptoServer.blockNum = block.number;

        console.log(`Network:${network} Block:#${block.number} block.timestamp: ${block.timestamp} updateFrequency:${updateFrequencyInBlocks} Oracle_lastUpdate_Block:#${oracle_lastUpdate_block_number} lastUpdate_Block:#${lastUpdate_block_number} nextUpdate_Block:#${nextUpdate_block_number}`);

        if (block.number >= (oracle_lastUpdate_block_number + updateFrequencyInBlocks) && oracle_lastUpdate_block_number >= lastUpdate_block_number) {
            console.log(`***** UPDATE ***** ${network} ${new Date().toISOString()} frequency:${updateFrequencyInBlocks} Block:#${block.number} Oracle_lastUpdate_Block:#${oracle_lastUpdate_block_number} lastUpdate_Block:#${lastUpdate_block_number} nextUpdate_Block:#${nextUpdate_block_number}`);
            lastUpdate_block_number = block.number;

            state_CryptoServer.state = "updating";  //future use
            
            console.log(`Getting tickers from Oracle to retrieve data for`);
            const oracleTickersArray = await crypto_project_Oracle.getTickers();
            console.log(`oracleTickersArray.length: ${oracleTickersArray.length}`);
            if (oracleTickersArray.length >0)
            {
                console.log("Getting data for the tickers from Coingecko");
                const dataSnapshotObj = await retrieveData.getCryptoData(oracleTickersArray);
                // console.log("dataSnapshotObj: ",dataSnapshotObj);

                console.log("sending fresh data to Oracle SC");
                const oracleDataUpdated = await crypto_project_Oracle.updateData(crypto_project_Oracle.oracleSpecs.priceReporter, dataSnapshotObj.prices, dataSnapshotObj.mcs);
                console.log(`oracleDataUpdated: ${oracleDataUpdated}`);  
                
                state_CryptoServer.state = "available"; //future use

                if (!oracleDataUpdated) 
                {
                    console.log(`Crypto Server > oracleDataUpdated:${oracleDataUpdated} We will setInitialConditions`);
                    setInitialConditions();
                }
            }
            else { 
                setInitialConditions(); 
                state_CryptoServer.state = "available"; 
            }
           
 
            //testing only REMEMBER TO SET function _setLastUpdateBlockNum(uint _lastUpdateBlockNum) public in sc
            // await crypto_project_Oracle.increaselastUpdateBlockNumber(block.number);
            // console.log(`UPDATING smart contract oracle_lastUpdate_block_number to ${block.number}`);
        }

        socket.emit('cryptoServer',{
            network,
            block_number  : block.number,
            block_timestamp  : block.timestamp,
            lastUpdate_block_number: oracle_lastUpdate_block_number,
            nextUpdate_block_number,
        });

    })
    .on('error',error => {
        console.log(error);
    });

};
//#endregion *** CRYPTO NETWORK WEB SOCKET  ****


module.exports = {
                    setSocket,
                    init_CryptoServer,
                    set_updateFrequencyInBlocks,
                    state_CryptoServer
                 }