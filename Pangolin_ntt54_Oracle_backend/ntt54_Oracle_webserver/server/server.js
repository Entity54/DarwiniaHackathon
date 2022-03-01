'use strict';
const express = require('express');
const fs = require('fs');
const path = require('path');             
const http = require('http');             
const socketIO = require('socket.io');
 
const crypto_project_BlockServer = require('./crypto_project_BlockServer.js');
const crypto_project_Oracle = require('./crypto_project_Oracle.js');
const crypto_project_MintManager = require('./crypto_project_MintManager.js');
const retrieveData  = require('./retrieveData.js');   
let network;


const publicPath = path.join(__dirname,'../public');       
const port = process.env.PORT || 3000;
var app = express();

app.use((req,res,next) => {
    let now = new Date().toString();
    let log = `${now}  Method: ${req.method}  URL: ${req.url}`;
    fs.appendFile('server.log',log + '\n',(err) => {
      if (err) {
        console.log('Can not append to the file');
      }
    })
    next();
});
 
const server = http.createServer(app); 
const io = socketIO(server);   

app.use(express.static(publicPath)); 


io.on('connection', (socket) => {

    console.log('New browser client connected');

    socket.on('connectToNetwork', async (clientQuery,callback) => {
        console.log("clientQuery: ",clientQuery);
        network = clientQuery.selection;
        if (clientQuery.btnHTML === "Connect")
        {
          console.log(`We will connect to network:${network}`);
          await crypto_project_Oracle.init_project_Oracle(network);
          await crypto_project_MintManager.init_project_MintManager(network);
          
          crypto_project_BlockServer.set_updateFrequencyInBlocks(Number(clientQuery.new_blockUpdateFrequency));
          crypto_project_BlockServer.init_CryptoServer(network);  //start crypto server and get info block by block

          callback({ 
            message: `Server has received a message from the client to connect to network: ${clientQuery.selection}`,
            groupedTickers: retrieveData.groupedTickers
          });
        }
        else {
          console.log(`We will disconnect from network:${network}`);
          callback({ message: `Server has received a message from the client to disconnect from network: ${clientQuery.selection}`});
        }
    });

    socket.on('updatePriceReporter',(msg) => { 
      console.log(`A new Price Reporter address: ${msg.new_PriceReporter} is requested to be used`);
      crypto_project_Oracle.isPriceReporter(msg.new_PriceReporter);
    });

    socket.on('updateFrequency',(msg) => { 
      console.log(`A new update frequency in Blocks: ${msg.new_blockUpdateFrequency} is requested to be used`);
      crypto_project_BlockServer.set_updateFrequencyInBlocks(Number(msg.new_blockUpdateFrequency));
    });

    socket.on('createNewOracle',(msg) => { 
      console.log(`A new Oracle smart contract will be created by admin address: ${msg.admin}`);
    });

    socket.on('managePriceReporter',(msg) => { 
      console.log(`Admin will update approval for a PriceReporter. Admin:${msg.admin} PriceReporter:${msg.priceReporterAddress} Approved:${msg.priceReporterApproveChecked}`);
      crypto_project_Oracle.approvePriceReporter(msg.priceReporterAddress, msg.priceReporterApproveChecked);
    });

    socket.on('checkReporterVailidity',(msg) => { 
      console.log(`A PriceReporter with address: ${msg.reporterAddress} will be checked if it is valid`);
      crypto_project_Oracle.isPriceReporter(msg.reporterAddress);
    });

    socket.on('manageTickers',(msg) => { 
      
      let counter = 0;
      const prepareTo_UpdateTickers = () => {
          
          //this should not run in the middle of an update as it will create issues with new tickers being added but no data being fetched for the new tickers
          if (counter <= 12  
              && crypto_project_BlockServer.state_CryptoServer.blockNum > crypto_project_BlockServer.state_CryptoServer.nextUpdate_block_number - 4 
              && crypto_project_BlockServer.state_CryptoServer.blockNum <= crypto_project_BlockServer.state_CryptoServer.nextUpdate_block_number) 
          {
            counter++;
            setTimeout(() => { prepareTo_UpdateTickers(); },5000);
            console.log(`Updating Tickers is being delayed by 5secs because server is not available yet and processing another transaction`);
          }
          else if (counter <= 12) {

              if (msg.tickersLongString!=="")
              {
                console.log(`Admi:${msg.admin} will update the tickers to: ${msg.tickersLongString}`);
                let symbolListArray = [], tiksListArray = [];

                if (msg.tickersLongString === "TOP_MC,Kusama,Polkadot") {
                  let polkadotT = retrieveData.groupedTickers.polkadot_Tickers;
                  let kusamaT = retrieveData.groupedTickers.kusama_Tickers;
                  const top100T = retrieveData.groupedTickers.mc_top100_Tickers
                  polkadotT = polkadotT.filter( ticker => !top100T.includes(ticker.toLowerCase()) );
                  kusamaT = kusamaT.filter( ticker => !top100T.includes(ticker.toLowerCase()) );
                  symbolListArray = [...top100T,...kusamaT,...polkadotT];
                  symbolListArray = symbolListArray.map(item => item.toLowerCase());

                  let polkadotTiks = retrieveData.groupedTiks.polkadot_tiks;
                  let kusamaTiks = retrieveData.groupedTiks.kusama_tiks;
                  const top100Tiks = retrieveData.groupedTiks.mc_top100_tiks
                  polkadotTiks = polkadotTiks.filter( ticker => !top100Tiks.includes(ticker.toLowerCase()) );
                  kusamaTiks = kusamaTiks.filter( ticker => !top100Tiks.includes(ticker.toLowerCase()) );
                  tiksListArray = [...top100Tiks,...kusamaTiks,...polkadotTiks];
                  tiksListArray = tiksListArray.map(item => item.toLowerCase());

                  console.log(`polkadotT.length:${polkadotT.length} kusamaT.length:${kusamaT.length} top100T.length:${top100T.length} polkadotTiks.length:${polkadotTiks.length} kusamaTiks.length:${kusamaTiks.length} top100Tiks.length:${top100Tiks.length}`);
                }
                else if (msg.tickersLongString === "Coming soon...") {
                    console.log(`More tickers coming soon`);
                    return;
                }
                else {
                  let symbol_ListString = msg.tickersLongString; //"karura,darwinia-crab-network,moonriver,shiden"
                  symbolListArray = symbol_ListString.toLowerCase().split(","); 

                  //coingeckoTickersList schema  { id: '01coin', symbol: 'zoc', name: '01coin' }
                  const custom_coinsList = coingeckoTickersList.filter( item => symbolListArray.includes(item.id.toLowerCase()) );
                  tiksListArray = custom_coinsList.map( item => (item.symbol).toLowerCase()); 
                }
                console.log(`symbolListArray.length:${symbolListArray.length} symbolListArray: `,symbolListArray,` tiksListArray.length:${tiksListArray.length} tiksListArray: `,tiksListArray);
          
                crypto_project_Oracle.updateTickers(symbolListArray, tiksListArray); //expects arrays like ["bitcoin","polkadot"],["btc","dot"]
              }

          } else console.log(`After multiple efforts to update tickers the transaction will not be submitted`);

      }
      prepareTo_UpdateTickers();

      //TODO can be improved by queuing transactions
    });

    socket.on('remove_Ticker',(msg) => { 

      let counter = 0;
      const prepareTo_removeTicker = () => {

        //this should not run in the middle of an update as it will create issues with new ticker being removed but data being fetched for this ticker
        if (counter <= 12  
            && crypto_project_BlockServer.state_CryptoServer.blockNum > crypto_project_BlockServer.state_CryptoServer.nextUpdate_block_number - 4 
            && crypto_project_BlockServer.state_CryptoServer.blockNum <= crypto_project_BlockServer.state_CryptoServer.nextUpdate_block_number) 
        {
          counter++;
          setTimeout(() => { prepareTo_removeTicker(); },5000);
          console.log(`Removin Ticker is being delayed by 5secs because server is not available yet and processing another transaction`);
        }
        else if (counter <= 12) {
            console.log(`Ticker ${msg.removeTicker} has been requested to be removed`);
            crypto_project_Oracle.removeTicker(msg.removeTicker);
        } else console.log(`After multiple efforts to remove ticker the transaction will not be submitted`);
      }
      prepareTo_removeTicker();

      //TODO can be improved by queuing transactions
    });

    socket.on('getData',(msg) => { 
      console.log(`Data for ticker: ${msg.ticker} has been requested`);
      crypto_project_Oracle.getDataforTicker(msg.ticker);
    });

    socket.on('getAllDataSnapshot',(msg) => { 
      let requestedTickers;
      if (msg.allTickers.toLowerCase() === "all" ) requestedTickers = "ALL"
      else requestedTickers = msg.allTickers;
      console.log(`A data snapshot for tickers: ${requestedTickers} has been requested`);

      crypto_project_Oracle.getAllData(requestedTickers);
    });


    socket.on('mintTokens',(msg) => { 
      console.log(`For all tokens in Oracle with 0 address we will mint Liquidity equal to Total Supply.`);
      crypto_project_MintManager.mintTickers();
    });
    socket.on('changeERC20Admin',(msg) => { 
      console.log(`Change admin for ERC20 tokens ${msg.tokensToChangeAdminString} to ${msg.newERC20AdminAddress}.`);
      crypto_project_MintManager.changeAdminOfERC20(msg.newERC20AdminAddress, msg.tokensToChangeAdminString);
    });
    socket.on('approveNewLiquidityOwner',(msg) => { 
      console.log(`Approve address ${msg.newLiquidityOwnerAddress} so all held liquidity can be transferred to it e.g. a DEX address`);
      crypto_project_MintManager.approveAddressForLiquidity(msg.newLiquidityOwnerAddress);
    });


    socket.on('erc20_getBalanceBtn',(msg) => { 
      console.log(`erc20_getBalanceBtn msg: `,msg);
      crypto_project_MintManager.erc20_balanceOfAccount(msg.erc20Address, msg.accountAddress);
    });
    socket.on('erc20_getAllowanceBtn',(msg) => { 
      console.log(`erc20_getAllowanceBtn msg: `,msg);
      crypto_project_MintManager.erc20_allowanceOfAccount(msg.erc20Address, msg.accountAddress);
    });
    socket.on('erc20_getAdminBtn',(msg) => { 
      console.log(`erc20_getAdminBtn msg: `,msg);
      crypto_project_MintManager.erc20_admin(msg.erc20Address);
    });
    socket.on('erc20_mintBtn',(msg) => { 
      console.log(`erc20_mintBtn msg: `,msg);
      crypto_project_MintManager.erc20_mint(msg.erc20Address, msg.accountAddress , msg.amount);
    });


    

    socket.on('disconnect', () => {
      console.log('User was disconnected');
    });

    
    crypto_project_BlockServer.setSocket(socket); 
    crypto_project_Oracle.setSocket(socket); 
    crypto_project_MintManager.setSocket(socket); 

    retrieveData.setSocket(socket); 
    retrieveData.coingecko_Initiation();   //prepare CoinGecko to retrieve data collects tickers list for all coins, categories and stablecoins

});


server.listen(port, () => {
  console.log(`Oracle Server is up on port ${port}`);
});
