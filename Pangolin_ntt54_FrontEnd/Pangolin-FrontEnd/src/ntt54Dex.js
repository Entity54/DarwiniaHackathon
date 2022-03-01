import { ethers } from 'ethers';

import ntt54_ERC20_raw from './Abis/ntt54_ERC20';       
import ntt54_Oracle_raw from './Abis/ntt54_Oracle';       
import ntt54_DEX_raw from './Abis/ntt54_DEX';           
// import ntt54_Factory_raw from './Abis/ntt54_Factory';         

// const admin             = "0x8731732996d815E34DA3eda6f13277a919b3d0d8";
// const reporter          = "0x563FD94f1A141a2289A5746b7A6f0bE9fB27daf0";
// const client            = "0xB504b48Ad86b5946D2fD465e07E3A8F7Bb57F812";
// const olddexAddress     = "0xccD615B5754602cd6b135c1911184B3B1446Cfb8";  
const dexAddress           = "0x2656b7D257E3D0421D3f9670FdD4A76Fdfb623d2";    
const oracleAddress        = "0x357C23877e32C6E01a7518F7e37d15aC338cdf0c";
const stableCoinAddress    = "0x7b9c459a91D652814394843DB92170f401f9dF70";
// const factoryAddress    = "0x8f350E2506549eB7C2e7DF001eD16028aBa347E3";

let dex, oracle, stable  ; //factory
let wallet;
const setWallet = (_wallet=null) => {
    if (_wallet) {
        wallet = _wallet;
        dex     =  new ethers.Contract( dexAddress, ntt54_DEX_raw.abi, wallet);
        oracle  =  new ethers.Contract( oracleAddress, ntt54_Oracle_raw.abi, wallet);
        // factory =  new ethers.Contract( factoryAddress, ntt54_Factory_raw.abi, wallet);
        stable  =  new ethers.Contract( stableCoinAddress, ntt54_ERC20_raw.abi, wallet);
    }
}


 
    //***** GET FAUCET BALANCE LEFT//*****
    const getFaucetBalanceLeft = async (client) => {
        const mintedStableforClient_WEI = await dex.faucetMinted(client);
        const max_faucet_allowance_WEI = await dex.max_faucet_allowance();
        console.log(`getFaucetBalanceLeft => ${ethers.utils.formatUnits(mintedStableforClient_WEI,18)} ${ethers.utils.formatUnits(max_faucet_allowance_WEI,18)} ${client}`)
        const remainingWEI = max_faucet_allowance_WEI.sub(mintedStableforClient_WEI);
        const remaining = ethers.utils.formatUnits(remainingWEI,18);
        return remaining;
    };

    //***** GET FAUCET ALREADY MINTED //*****
    const getFaucetMinted = async (client) => {
        const mintedStableforClient_WEI = await dex.faucetMinted(client);
        return ethers.utils.formatUnits(mintedStableforClient_WEI,18);
    };
    

    // const getAllData = async (ntt54Oracle_sc) => {
    const getAllData = async () => {
        if (dex)
        {
            const tokensStructsArray = await dex.getAllTokens();
            const stableObj = {name: ethers.utils.toUtf8String( tokensStructsArray[0][0] ) , ticker: ethers.utils.toUtf8String( tokensStructsArray[0][1] ).toUpperCase(), _ticker: tokensStructsArray[0][0], _tik: tokensStructsArray[0][1], tokenAddress: tokensStructsArray[0][2] };

            let balance = [];
            const numTokens = tokensStructsArray.length;
            for (let i=1; i< numTokens; i++) {
                balance.push({name: ethers.utils.toUtf8String( tokensStructsArray[i][0] ) , ticker: ethers.utils.toUtf8String( tokensStructsArray[i][1] ).toUpperCase(), _ticker: tokensStructsArray[i][0], _tik: tokensStructsArray[i][1], tokenAddress: tokensStructsArray[i][2] });
            }
            
            return balance;
        } else return null;
    };
  
    //***** GET TOKEN/STABLE PRICE //*****
    const getPrice = async (tokenID) => {
        const priceWEI = await dex.getTokenStablePrice(tokenID);
        const price = ethers.utils.formatUnits(priceWEI,18);
        return price;
    };

    //***** FAUCET MINT TOKENS //*****
    const faucet = async (amountInPringEth=1000) => {
        return new Promise( async (resolve,reject) => {
            const tx1 =  await dex.faucetStable(amountInPringEth);
            tx1.wait().then( message => {
               console.log(`FAUCET HAS MINTED STABLE COINS message : `,message);
               resolve(message);
            })
            .catch( error => reject(error));

        })
    };


    //***** GET BALANCE FOR TOKEN //*****
    const getBalance = async (tokenAddress, client) => {
        const erc20 =  new ethers.Contract( tokenAddress, ntt54_ERC20_raw.abi, wallet);
        const balanceWEI = await erc20.balanceOf(client);
        const balance = ethers.utils.formatUnits(balanceWEI,18);
        // console.log(`Balnance of ${client} for ${tokenAddress} is: `,balance);
        return balance;
    };

    //***** GET BALANCE FOR STABLE //*****
    const getStableBalance = async (client) => {
        const balanceWEI = await stable.balanceOf(client);
        const balance = ethers.utils.formatUnits(balanceWEI,18);
        // console.log(`Balnance of ${client} for ${tokenAddress} is: `,balance);
        return balance;
    };

    //***** CHECK ALLOWANCE FOR STABLR //*****
    const checkAllowanceOfStabletoDEX = async (client) => {
        let allowanceDexfromClient = await stable.allowance(client, dexAddress);
        const allowance = ethers.utils.formatUnits(allowanceDexfromClient,18);
        console.log(`allowanceDexfromClient: `,allowance);
        return allowance;
    };

    //***** CHECK ALLOWANCE FOR TOKEN //*****
    const checkAllowanceOfTokentoDEX = async (wallet, tokenAddress, client) => {
        const erc20 =  new ethers.Contract( tokenAddress, ntt54_ERC20_raw.abi, wallet);
        let allowanceDexfromClient = await erc20.allowance(client, dexAddress);
        const allowance = ethers.utils.formatUnits(allowanceDexfromClient,18);
        console.log(`allowanceDexfromClient: `,allowance);
        return allowance;
    };


    //***** SWAP STABLE FOR TOKEN //*****
    const swapStableForToken = async (tokenId, amountin_unitsEth="100") => {
        console.log(`swapStableForToken > RECEIVED tokenId:${tokenId} AND AMOUNT: ${amountin_unitsEth}`);
        let amountOfStableToSwapForToken =  ethers.BigNumber.from( ethers.utils.parseUnits(amountin_unitsEth,18) );
        console.log(`Client wants to Swap ${amountOfStableToSwapForToken} Stable WEI for Token. NEED TO APPROVE TRANSFER OF THIS STABLE FROM CLIENT ACCOUNT TO DEX`);
        
        return new Promise (async (resolve,reject) => {
            const tx2 = await stable.approve(dexAddress, amountOfStableToSwapForToken );
            tx2.wait().then( async reslveMsg => {
                console.log(`APPROVAL TRANSACTION tx2 is mined resolveMsg : `,reslveMsg);
                
                // *** SWAP ***
                const tx3 = await dex.swapStableForToken(tokenId, amountOfStableToSwapForToken); 
                tx3.wait().then( async resolveMsg => {
                    console.log(`PART swapStableForToken resolveMsg: `,resolveMsg);
                    const tokensReceived = ethers.utils.formatUnits( (resolveMsg.events[resolveMsg.events.length-1]).args[4] , 18 );
                    console.log(`swap stableTotoken tokensReceived : `,tokensReceived);
                    resolve(tokensReceived);
                })
                .catch( error => reject(error) );
                 
            })

        })

    };


    //***** SWAP TOKEN FOR STABLE //*****
    const swapTokenForStable = async (tokenAddress, tokenId, amountin_unitsEth="0.001") => {
        const erc20 =  new ethers.Contract( tokenAddress, ntt54_ERC20_raw.abi, wallet);

        let amountOfTokenToSwapForStable =  ethers.BigNumber.from( ethers.utils.parseUnits(amountin_unitsEth,18) );
        console.log(`Client wants to Swap ${amountOfTokenToSwapForStable} Tokens WEI for Stable. NEED TO APPROVE TRANSFER OF THIS TOKEN FROM CLIENT ACCOUNT TO DEX`);

        return new Promise (async (resolve,reject) => {
            const tx2 = await erc20.approve(dexAddress, amountOfTokenToSwapForStable );
            tx2.wait().then( async reslveMsg => {
                 console.log(`APPROVAL TRANSACTION tx2 is mined resolveMsg : `,reslveMsg);
                
                // *** SWAP ***
                const tx3 = await dex.swapTokenForStable(tokenId, amountOfTokenToSwapForStable); 
                tx3.wait().then( async resolveMsg => {
                    console.log(`PART swapTokenForStable resolveMsg: `,resolveMsg);
                    const stableReceived = ethers.utils.formatUnits( (resolveMsg.events[resolveMsg.events.length-1]).args[4] , 18 );
                    console.log(`swap tokenTostable stableReceived : `,stableReceived);
                    resolve(stableReceived);
                })
                .catch( error => reject(error) );
            });

        })

    };


 


export {
    setWallet,
    getAllData,
    getBalance,
    getStableBalance,
    getPrice,
    getFaucetBalanceLeft,
    getFaucetMinted,
    faucet,
    checkAllowanceOfStabletoDEX,
    checkAllowanceOfTokentoDEX,
    swapStableForToken,
    swapTokenForStable,
}