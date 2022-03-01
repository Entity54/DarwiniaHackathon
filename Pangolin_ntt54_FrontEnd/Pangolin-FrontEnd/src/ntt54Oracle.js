import { ethers } from 'ethers';
 
import ntt54_ERC20_raw from './Abis/ntt54_ERC20';      //Address in Pangolin 0xdB0A4192d9b0130E2e5DB945380441DeE7099eDb


const transfer_nativeToken = async (wallet, amount, toAddress) => {
    // const amount = _amount.toString();
    // console.log(`transfer_nativeToken ${typeof amount} amount : `,amount);
      const tx = {
          to: toAddress,
          value: ethers.utils.parseEther(amount),
      };
    const receipt = await wallet.sendTransaction(tx);
    return receipt;
}

const transfer_ERC20 = async (wallet, tokenAddress, amount, toAddress) => {
    // const amount = _amount.toString();
    const erc20 =  new ethers.Contract( tokenAddress, ntt54_ERC20_raw.abi, wallet);
    const overrides = { 
        gasLimit: await erc20.estimateGas.transfer(toAddress,  ethers.utils.parseUnits(amount,18)),
        gasPrice: await wallet.getGasPrice(),
    };
    const tx = await erc20.transfer(toAddress,  ethers.utils.parseUnits(amount,18), overrides);
  
    // const balanceWEI = await erc20.balanceOf(accountAddress);
    // const balance = ethers.utils.formatUnits( balanceWEI, 18 );    //web3.utils.fromWei( balanceWEI.toString() );

    return tx;
}


const getAllData = async (ntt54Oracle_sc) => {
    if (ntt54Oracle_sc)
    {
        const {"0":_tickers,"1":_tiks, "2":_timestamp, "3":_prices, "4":_mcs, "5":tokenAddresses } = await ntt54Oracle_sc.getAllData();
        
        //convert bytes32 to string
        const tickers = _tickers.map( item => ethers.utils.toUtf8String( item ) );   // web3.utils.hexToUtf8( item ) );
        const tiks = _tiks.map( item => ethers.utils.toUtf8String( item ) );   //web3.utils.hexToUtf8( item ) );
        //convert prices from Wei
        const prices = _prices.map( prc => ethers.utils.formatUnits( prc, 18 ) );  //web3.utils.fromWei( prc ) );
        const mcs = _mcs.map( prc => prc.toString());  
        const timestamp = _timestamp.map( ts => ts.toString());  

        // console.log(`getAllData tickers: `,tickers[0]);   
        // console.log(`getAllData tiks: `,tiks[0]);   
        // console.log(`getAllData prices: `,prices[0]);   
        // console.log(`getAllData mcs: `,mcs[0]);   
        // console.log(`getAllData> tokenAddresses: `,tokenAddresses[0]);

        return {_tickers, _tiks, timestamp, _prices, mcs, tokenAddresses, tickersStrings: tickers, tiksString: tiks, pricesBaseCur: prices};
    } else return null;
};


const erc20_balanceOfAccount = async (erc20_address, accountAddress, provider) => {
    
    if (erc20_address && accountAddress && provider)
    {
        const erc20 =  new ethers.Contract(erc20_address, ntt54_ERC20_raw.abi, provider);
        const balanceWEI = await erc20.balanceOf(accountAddress);
        const balance = ethers.utils.formatUnits( balanceWEI, 18 );    
        // console.log(`erc20_balanceOfAccount >  of ERC20: ${erc20_address} for ${accountAddress} is: ${balance}`);
        return balance;
    }
    return null;
};

const getAccountBalance = async (oracleData, accountAddress, accountBalance, provider) => {

    if (oracleData.tokenAddresses && accountAddress && provider)
    {
        let balance = [];
        balance.push({name: "Pring", ticker: "PRING", NumTokens: Number(accountBalance).toFixed(5), Value: Number(accountBalance).toFixed(2), tokenAddress: "0x0000"});

        const numTokens = oracleData.tokenAddresses.length;
        for (let i=0; i< numTokens; i++) {
            const tokenAmount = await erc20_balanceOfAccount(oracleData.tokenAddresses[i], accountAddress, provider);
            const value = (tokenAmount * oracleData.pricesBaseCur[i]).toFixed(2) ;
            balance.push({name: oracleData.tickersStrings[i], ticker: (oracleData.tiksString[i]).toUpperCase() , NumTokens: tokenAmount? Number(tokenAmount).toFixed(5) :0, Value: Number(value).toFixed(2), tokenAddress: oracleData.tokenAddresses[i] });
        }
        return balance;
    } else return null;

}
 


export {
    getAllData,
    getAccountBalance,
    transfer_nativeToken,
    transfer_ERC20,
}