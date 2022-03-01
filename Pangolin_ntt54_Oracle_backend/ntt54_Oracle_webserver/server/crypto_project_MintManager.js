'use strict';
const crypto_project_Oracle = require('./crypto_project_Oracle.js');
const retrieveData  = require('./retrieveData.js');   

const ntt54ERC20_Artifact = require('../../ntt54_Oracle_truffle/build/contracts/ntt54_ERC20.json');  

const ntt54MinManager_Artifact = require('../../ntt54_Oracle_truffle/build/contracts/ntt54_Factory.json');  
const {getWeb3, getSmartContractAbstraction} = require('./web3_setup.js');
const { min } = require('moment');

let socket = {};                                                     
let setSocket = (frontEndSocket) => { socket = frontEndSocket; };    
let web3;
let ntt54MintManager_sc, ntt54MintManager_sc_address, administrator;
let mintManagerSpecs = { administrator, ntt54MintManager_sc_address, };


let init_project_MintManager = async (network) => {
    console.log(`ntt54MinManager_Artifact is initialised`);    
    web3 = await getWeb3(network);     

    const accounts = await web3.eth.getAccounts();
    console.log(`ntt54Factory_Artifact => accounts: `,accounts);

    const {contractAbstraction, contractAddress} = await getSmartContractAbstraction(web3,ntt54MinManager_Artifact);
    ntt54MintManager_sc = contractAbstraction;
    ntt54MintManager_sc_address = contractAddress;
    mintManagerSpecs.ntt54MintManager_sc_address = contractAddress;
    console.log(`ntt54MinManager_Artifact => ntt54MintManager_sc_address: `,ntt54MintManager_sc_address);

    administrator = await ntt54MintManager_sc.methods.admin().call();
    mintManagerSpecs.administrator = administrator;
    console.log(`ntt54MintManager_sc => administrator: `,administrator);
    
    socket.emit('mintManagerSpecs',{
        ntt54MintManagerSC_address : ntt54MintManager_sc_address,
        admin_address   : administrator,
        createdAt: new Date().getTime()
    });

};




//CALLS
const erc20_balanceOfAccount = async (erc20_address, accountAddress) => {
    if (erc20_address && accountAddress)
    {
        const erc20 = new web3.eth.Contract( ntt54ERC20_Artifact.abi, erc20_address );

        const balanceWEI = await erc20.methods.balanceOf(accountAddress).call();
        const balance = web3.utils.fromWei( balanceWEI.toString() );

        console.log(`erc20_balanceOfAccount >  of ERC20: ${erc20_address} for ${accountAddress} is: ${balance}`);
        socket.emit('response_erc20_getBalanceBtn',{
            balance,    
        });
        return balance;
    }
    return null;
};

const erc20_allowanceOfAccount = async (erc20_address, accountAddress) => {
 
    if (erc20_address && accountAddress)
    {
        const erc20 = new web3.eth.Contract( ntt54ERC20_Artifact.abi, erc20_address );

        const allowanceWEI = await erc20.methods.allowance(ntt54MintManager_sc_address, accountAddress).call();
        const allowance = web3.utils.fromWei( allowanceWEI.toString() );

        console.log(`erc20_allowanceOfAccount >  of ERC20: ${erc20_address} for ${accountAddress} is: ${allowance}`);
        socket.emit('response_erc20_getAllowanceBtn',{
            allowance,    
        });
        return allowance;
    }
    return null;
};

const erc20_admin = async (erc20_address) => {

    if (erc20_address)
    {
        const erc20 = new web3.eth.Contract( ntt54ERC20_Artifact.abi, erc20_address );
        const erc20Admin = await erc20.methods.admin().call();
        console.log(`erc20_admin: >  of ERC20: ${erc20_address} is: ${erc20Admin}`);
        socket.emit('response_erc20_getAdminBtn',{
            erc20Admin,    
        });
        return erc20Admin;
    }
    return null;
};




//#region getAllMintedTokens
const getAllMintedTokens = async () => {
    if (ntt54MintManager_sc)
    {
        const tokenStructsArray = await ntt54MintManager_sc.methods.getAllTokens().call();
        console.log(`ntt54_Factory > getAllMintedTokens tokenStructsArray: `,tokenStructsArray);
        
        // Example Output
        // tokenStructsArray
        // [
        //     [
        //       '0x626974636f696e00000000000000000000000000000000000000000000000000',
        //       '0x6274630000000000',
        //       '669629050662',
        //       '0xB0456f983E17230f05E38B62dCBCBFc37E16c144',
        //       tokenID: '0x626974636f696e00000000000000000000000000000000000000000000000000',
        //       tokenTicker: '0x6274630000000000',
        //       tokenSupply: '669629050662',
        //       tokenAddress: '0xB0456f983E17230f05E38B62dCBCBFc37E16c144'
        //     ]
        // ]

        let _tokenIDs=[], _tokenTickers=[], tokenIDs=[], tokenTickers=[], totalSupply=[], tokenAddressses=[];
        tokenStructsArray.forEach((item) => { 
            console.log(`getAllMintedTokens > item tokenID:${item[0]} , tokenTicker:${item[1]} , tokenSupply:${item[2]} , tokenAddress:${item[3]}`); 
            _tokenIDs.push(item[0]);
            _tokenTickers.push(item[1]);
            tokenIDs.push(web3.utils.hexToUtf8(item[0]));
            tokenTickers.push(web3.utils.hexToUtf8(item[1]));
            totalSupply.push(item[2]);
            tokenAddressses.push(item[3]);
        });
        
        socket.emit('mintedTokensProcedure',{
            tokenIDs,
            tokenTickers,
            totalSupply,
            tokenAddressses,
            createdAt: new Date().getTime()
        });

        return {_tokenIDs, _tokenTickers, tokenAddressses, totalSupply, tokenIDs, tokenTickers,};

    } else return null;
};
//#endregion getAllMintedTokens




//SIGNED TRANSACTIONS
//#region mintTickers
const mintTickers = async () => {

    const oracleResponse = await crypto_project_Oracle.getAllData();

    if (oracleResponse && web3 && ntt54MintManager_sc && administrator)
    {
        const marketStats = retrieveData.marketStats();

        let _tickers=[],_tiks=[], cspls=[];
 
        for (let i=0; i< oracleResponse.tokenAddresses.length; i++)
        {

            if (oracleResponse.tokenAddresses[i]==='0x0000000000000000000000000000000000000000')
            {
                _tickers.push(oracleResponse._tickers[i]);
                _tiks.push(oracleResponse._tiks[i]);
                
                const marketStatsIndex = marketStats.cgTickers.findIndex( item => item.toLowerCase() ===  oracleResponse.tickersStrings[i] );
                if (marketStatsIndex===-1) 
                {
                    cspls.push(123456789000);
                    console.log(`mintTickers> ${oracleResponse.tickersStrings[i]} WAS NOT FOUND IN cgTickers, hence cspls was set to 12345678900`);
                }
                else cspls.push( web3.utils.toWei( ( marketStats.circulating_supply[marketStatsIndex] ).toString() ) );

            }
        };

        const numOfTickers= _tickers.length, spacing=5;
        //Note: spacing variable is used so that we do not hit any block limit gas constraints
        let counter = 0;
        counter = Math.min(numOfTickers, counter + spacing); 

        const startMinting = async (m_tickers, m_tiks, m_cspls) => {

                const gas = await ntt54MintManager_sc.methods.initialERC20Mint(m_tickers, m_tiks, m_cspls).estimateGas({from: administrator});
                const gasPrice = await web3.eth.getGasPrice();
                console.log(`ntt54_Factory > mintTickers => gas: ${gas} gasPrice: ${gasPrice}`);
            
                await ntt54MintManager_sc.methods.initialERC20Mint(m_tickers, m_tiks, m_cspls).send({from: administrator, gas: gas, gasPrice })
                                    .on('confirmation',async (confirmationNumber, receipt) => {
                                        if (confirmationNumber === 1)
                                        {
                                            const mTickers = m_tickers.map( item => web3.utils.hexToUtf8( item ) );
                                            console.log(`ntt54_Factory > Transaction to mint ERC20 tokens with mTickers: `,mTickers,` has been mined confirmationNumber: ${confirmationNumber} gasUsed: ${receipt.gasUsed}`);
                                            
                                            if (counter<numOfTickers)
                                            {
                                                const newCounter = Math.min(numOfTickers, counter + spacing); 
                                                startMinting(_tickers.slice(counter,newCounter), _tiks.slice(counter,newCounter), cspls.slice(counter,newCounter));
                                                counter = newCounter;
                                            }
                                            else {
                                                console.log(`FINISHED MINTING TOKENS TIME TO UPDATE ORACLE`);

                                                const tokenStructsArray = await getAllMintedTokens();
                                                if (tokenStructsArray) {
                                                    const {_tokenIDs, _tokenTickers, tokenAddressses, totalSupply, tokenIDs, tokenTickers } = tokenStructsArray;
                                                    console.log(`ntt54_Factory > After minting tokenStructsArray: `,tokenStructsArray);
                                                    
                                                    await crypto_project_Oracle.updateTokenAddresses(_tokenIDs, tokenAddressses, false);

                                                    console.log("All tokens with 0 address have now been minted");
                                                    socket.emit('mintedTokensTerminal',{ message: "All tokens with 0 address have now been minted" });
                                                }

                                                const admin_balance = await web3.eth.getBalance(administrator);
                                                socket.emit('updatedTickers',{
                                                    gasUsed: web3.utils.fromWei( receipt.gasUsed.toString() ),    
                                                    adminBalance: web3.utils.fromWei( admin_balance.toString() ),    
                                                    createdAt: new Date().getTime()
                                                });

                                            }

                                        }
                                    });
        
        }
        startMinting(_tickers.slice(0,counter), _tiks.slice(0,counter), cspls.slice(0,counter));

    }
};
//#endregion mintTickers




//#region approveAddressForLiquidity
const approveAddressForLiquidity = async (newLiquidityAddress) => {
    if (web3 && ntt54MintManager_sc && administrator)
    {
        console.log(`approve address ${newLiquidityAddress} to be able to get all liquidity administrator: ${administrator}`);

        const gas = await ntt54MintManager_sc.methods.approveAddress(newLiquidityAddress).estimateGas({from: administrator});
        const gasPrice = await web3.eth.getGasPrice();
        console.log(`gas: ${gas} gasPrice: ${gasPrice}`);
    
        await ntt54MintManager_sc.methods.approveAddress(newLiquidityAddress).send({from: administrator, gas, gasPrice })
                            .on('confirmation',async (confirmationNumber, receipt) =>  {
                                if (confirmationNumber === 1)
                                {
                                    console.log(`Transaction to approve address: ${newLiquidityAddress} to be able to transfer all available balance from Factory, has been mined confirmationNumber: ${confirmationNumber} gasUsed: ${receipt.gasUsed}`); 

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
//#endregion approveAddressForLiquidity


//#region changeAdminOfERC20
const changeAdminOfERC20 = async (newAdmin, tokenIDString="") => {
    if (web3 && ntt54MintManager_sc && administrator)
    {
        let tokenIDStringArray, numOfTokenIDs, counter = 0, totalGasUsed=0;

        const startChangeAdminOfERC20 = async (_newAdmin, tokenIDStr) => {
            const tokID = web3.utils.utf8ToHex(tokenIDStr);
            console.log(`Change Administrator of ERC20 token with tokenID: ${tokenIDStr} HEX:${tokID} to address ${_newAdmin} to be able to get all functionality for this ERC20`);

            const gas = await ntt54MintManager_sc.methods.changeAdminOfERC20(_newAdmin, tokID).estimateGas({from: administrator});
            const gasPrice = await web3.eth.getGasPrice();
            console.log(`gas: ${gas} gasPrice: ${gasPrice}`);
        
            await ntt54MintManager_sc.methods.changeAdminOfERC20(_newAdmin, tokID).send({from: administrator, gas, gasPrice })
                                .on('confirmation',async (confirmationNumber, receipt) =>  {
                                    if (confirmationNumber === 1)
                                    {
                                        console.log(`Transaction to change ERC20 ${tokenIDStr} HEX:${tokID}  Adminnistrator to: ${_newAdmin} to be able to get all functionality for this ERC20, has been mined confirmationNumber: ${confirmationNumber} gasUsed: ${receipt.gasUsed}`); 
                                        counter++;
                                        totalGasUsed +=receipt.gasUsed;

                                        if (counter < numOfTokenIDs) startChangeAdminOfERC20(newAdmin,tokenIDStringArray[counter]);
                                        else {
                                            console.log(`Change of Administrator to ${newAdmin} for ERC20 tokens ${tokenIDString} is now complete. Total ga used: ${web3.utils.fromWei( totalGasUsed.toString() )}`);

                                            socket.emit('resultOfChangeERC20Admin',{
                                                gasUsed: web3.utils.fromWei( totalGasUsed.toString() ),    
                                                result: "success" ,    
                                                createdAt: new Date().getTime()
                                            });

                                            const admin_balance = await web3.eth.getBalance(administrator);
                                            socket.emit('updatedTickers',{
                                                gasUsed: web3.utils.fromWei( receipt.gasUsed.toString() ),    
                                                adminBalance: web3.utils.fromWei( admin_balance.toString() ),    
                                                createdAt: new Date().getTime()
                                            });

                                        }
                                    }
                                });
        }

        if (tokenIDString==="")
        {
            const tokenStructsArray = await getAllMintedTokens();
            if (tokenStructsArray) {
                const {_tokenIDs, _tokenTickers, tokenAddressses, totalSupply, tokenIDs, tokenTickers } = tokenStructsArray;
                tokenIDStringArray = tokenIDs; 
                numOfTokenIDs= tokenIDStringArray.length;
                startChangeAdminOfERC20(newAdmin,tokenIDStringArray[counter]);
            }
            else console.log(`There are not any minted tokens to change their admin`);
        }
        else
        {
            tokenIDStringArray = tokenIDString.toLowerCase().split(","); 
            numOfTokenIDs= tokenIDStringArray.length;
            startChangeAdminOfERC20(newAdmin,tokenIDStringArray[counter]);
        }

    }
};
//#endregion changeAdminOfERC20




//#region FAUCET MINT ERC20 TOKENS 
//Note: The default ERC20 admin is Factory Address. Need too change ERC20Admin to the administator address before calling mint
const erc20_mint = async (erc20_address, toAddress,  _amount) => {
    
    const erc20Admin = await erc20_admin(erc20_address);

    if (erc20Admin===administrator)
    {
        console.log(`erc20_mint erc20_address ${erc20_address} toAddress:${toAddress} for: ${_amount}`);
        
        const erc20 = new web3.eth.Contract( ntt54ERC20_Artifact.abi, erc20_address );
        const amount = web3.utils.toWei( _amount.toString() );

        const gas = await erc20.methods.mint(toAddress, amount).estimateGas({from: administrator});
        const gasPrice = await web3.eth.getGasPrice();
        console.log(`gas: ${gas} gasPrice: ${gasPrice}`);
    
        await erc20.methods.mint(toAddress, amount).send({from: administrator, gas, gasPrice })
                            .on('confirmation',async (confirmationNumber, receipt) =>  {
                                if (confirmationNumber === 1)
                                {
                                    console.log(`erc20_mint Transaction to mint toAddress: ${toAddress} amount: ${amount}, has been mined confirmationNumber: ${confirmationNumber} gasUsed: ${receipt.gasUsed}`); 
                                    socket.emit('response_erc20_mintBtn',{
                                        message: "success",    
                                    });

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
//#endregion FAUCET MINT ERC20 TOKENS





module.exports = {
    setSocket,
    init_project_MintManager,

    getAllMintedTokens,
    mintTickers,
    approveAddressForLiquidity,
    changeAdminOfERC20,

    mintManagerSpecs,   
    
    erc20_balanceOfAccount,
    erc20_allowanceOfAccount,
    erc20_admin,
    erc20_mint,
 }

