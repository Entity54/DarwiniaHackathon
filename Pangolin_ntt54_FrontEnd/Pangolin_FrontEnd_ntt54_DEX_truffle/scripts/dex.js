//TRY $truffle exec scripts/dex.js --network pangolin
const ntt54_Oracle = artifacts.require("ntt54_Oracle.sol");
const ntt54_Factory = artifacts.require("ntt54_Factory.sol");
const ntt54_ERC20 = artifacts.require("ntt54_ERC20.sol");
const ntt54_DEX = artifacts.require("ntt54_DEX.sol");

const DEXaddress = "0x2656b7D257E3D0421D3f9670FdD4A76Fdfb623d2";
// const old DEXaddress = "0xccD615B5754602cd6b135c1911184B3B1446Cfb8";
// const old DEXaddress = "0xBf10Babd3D8dBC04e2c766E902bea9756Fa0B2af";
// const old DEXaddress = "0x30e39cb427B2B16b5EF6261289fb21672F6Da227";
// const old DEXaddress = "0x7a064e6352f8a63c6d459474F4E1c2a21FE48D81";

//   DEX admin            = 0x8731732996d815E34DA3eda6f13277a919b3d0d8
//   PANGOLIN ORACLE      = 0x357C23877e32C6E01a7518F7e37d15aC338cdf0c
//   PANGOLIN FACTORY     = 0x8f350E2506549eB7C2e7DF001eD16028aBa347E3
//   ADMIN FOR BOTH       = 0x8731732996d815E34DA3eda6f13277a919b3d0d8
//   AUSD ADDRESS         = 0x7b9c459a91D652814394843DB92170f401f9dF70


module.exports = async done => {

    //state admin and reporter
    const [_admin,_reporter,_] = await web3.eth.getAccounts();
    const client = _reporter;   
    console.log(`ntt54_Oracle _admin: ${_admin} _reporter: ${_reporter} client:${client}`);

    // let DEX_Balance      = web3.utils.fromWei(await web3.eth.getBalance(DEXaddress));
    // let admin_Balance    = web3.utils.fromWei(await web3.eth.getBalance(_admin));
    // let reporter_Balance = web3.utils.fromWei(await web3.eth.getBalance(_reporter));
    // let client_Balance   = web3.utils.fromWei(await web3.eth.getBalance(client));
    // console.log(`DEX_Balance: ${DEX_Balance} admin_Balance: ${admin_Balance} reporter_Balance:${reporter_Balance} client_Balance:${client_Balance}`);

    //deployed sc addresses
    const oracle  = await ntt54_Oracle.deployed();
    const factory = await ntt54_Factory.deployed();
    const dex     = await ntt54_DEX.deployed();
    console.log(`dex.address:${dex.address} oracle.address:${oracle.address} factory.address:${factory.address}`);

    //CALL
    const admin                = await dex.admin();
    const oracleAddress        = await dex.oracleAddress();
    const quoteTokenID         = await dex.quoteTokenID();
    const max_faucet_allowance = await dex.max_faucet_allowance();
    console.log(`admin:${admin} oracleAddress:${oracleAddress} quoteTokenID:${quoteTokenID} max_faucet_allowance:${max_faucet_allowance}`);
    // admin:0x8731732996d815E34DA3eda6f13277a919b3d0d8 oracleAddress:0x357C23877e32C6E01a7518F7e37d15aC338cdf0c quoteTokenID:0x6175736400000000000000000000000000000000000000000000000000000000 max_faucet_allowance:100000000000000000000000000000000000000000

     // function getContractBalance() public view returns (uint256) {
    const contractBalance = await dex.getContractBalance();
    console.log(`contractBalance: `, web3.utils.fromWei(contractBalance));

    //function getAllTokenIDstrings() external view returns(string[] memory) {
    const tokenIDstringsArray = await dex.getAllTokenIDstrings();
    // console.log(`tokenIDstringsArray: `,tokenIDstringsArray);
    // tokenIDstringsArray:  [
    //     'ausd\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
    //   ]

    // function getAllTokenIDs() external view returns(bytes32[] memory) {
    const allTokenIDsArray = await dex.getAllTokenIDs();
    // console.log(`allTokenIDsArray: `,allTokenIDsArray);
    // allTokenIDsArray:  [
    //     '0x6175736400000000000000000000000000000000000000000000000000000000'
    //   ]

    // function getAllTokens() external view returns(Token[] memory) {
    const tokensStructsArray = await dex.getAllTokens();
    // console.log(`tokensStructsArray: `,tokensStructsArray);
    // tokensStructsArray:  [
    //     [
    //       '0x6175736400000000000000000000000000000000000000000000000000000000',
    //       '0x6175736400000000',
    //       '0x7b9c459a91D652814394843DB92170f401f9dF70',
    //       tokenID: '0x6175736400000000000000000000000000000000000000000000000000000000',
    //       tokenTicker: '0x6175736400000000',
    //       tokenAddress: '0x7b9c459a91D652814394843DB92170f401f9dF70'
    //     ]
    //   ]


    //STABLE COIN DECLARATIONS DELEETE
            // const STABLE_TOKENID = tokensStructsArray[0][0];
            // const STABLE_TIK     = tokensStructsArray[0][1];
            // const STABLE_ADDRESS = tokensStructsArray[0][2];
            // const STABLE_ERC20   = await ntt54_ERC20.at(STABLE_ADDRESS);
            // const STABLE_ADMIN   = await STABLE_ERC20.admin();
            // console.log(`STABLE_TOKENID:${STABLE_TOKENID} STABLE_TIK:${STABLE_TIK} STABLE_ADDRESS:${STABLE_ADDRESS} STABLE_ADMIN:${STABLE_ADMIN}`);
            


    const tokenID_0 = await dex.tokenIDs(0);
    // console.log(`tokenID_0: `,tokenID_0);
    // tokenID_0:  0x6175736400000000000000000000000000000000000000000000000000000000

    const token_0_Struct = await dex.tokens(tokenID_0);
    // console.log(`token_0_Struct: `,token_0_Struct);
    // token_0_Struct:  Result {
    //     '0': '0x6175736400000000000000000000000000000000000000000000000000000000',
    //     '1': '0x6175736400000000',
    //     '2': '0xE47CbE9a6D2308C93Cc20B0b42815B4cb1546A6e',
    //     tokenID: '0x6175736400000000000000000000000000000000000000000000000000000000',
    //     tokenTicker: '0x6175736400000000',
    //     tokenAddress: '0xE47CbE9a6D2308C93Cc20B0b42815B4cb1546A6e'
    //   }

    //Check minted amount for Client Address
    // const mintedStableWEIforClient = (await dex.faucetMinted(client)).toString();
    // console.log(`mintedStableWEIforClient: `,mintedStableWEIforClient);
 

    //#region ORACLE
    //get All Data
    // let {"0":tickers, "1":tiks, "2":timestamps, "3":prices, "4":mcs, "5":tokenAddrs} = await oracle.getAllData();
    // console.log(`tickers.length: ${tickers.length} timestamps.length: ${timestamps.length} prices.length: ${prices.length} mcs.length: ${mcs.length}`);
    // // for (let i=0; i < tickers.length; i++) {
    // for (let i=0; i < 5; i++) {
    //     console.log(`A> TICKER:${web3.utils.hexToUtf8(tickers[i])} TIK:${web3.utils.hexToUtf8(tiks[i])} TS: ${timestamps[i]} PRICE: ${web3.utils.fromWei(prices[i])} MC: ${mcs[i]} TokenAddress: ${tokenAddrs[i]}`);
    // };
    // for (let i=0; i < 5; i++) {
    //     console.log(`B> TICKER:${tickers[i]} TIK:${tiks[i]} TS: ${timestamps[i]} PRICE: ${web3.utils.fromWei(prices[i])} MC: ${mcs[i]} TokenAddress: ${tokenAddrs[i]}`);
    // };
        /*
        tickers.length: 114 timestamps.length: 114 prices.length: 114 mcs.length: 114
        A> TICKER:bitcoin TIK:btc TS: 1645991520 PRICE: 38177 MC: 724677866780 TokenAddress: 0x2FBeAA55F64189e2195265883eDE64809C00d55B
        A> TICKER:ethereum TIK:eth TS: 1645991520 PRICE: 2645.11 MC: 316770318234 TokenAddress: 0x3F6AdcF272A46191D5f398cef2aEa1765DBb051A
        A> TICKER:binancecoin TIK:bnb TS: 1645991520 PRICE: 364.52 MC: 61247490491 TokenAddress: 0xc9d4A59a8aE7a3E8389b02cB783e16ac94E2527d
        A> TICKER:ripple TIK:xrp TS: 1645991520 PRICE: 0.719829 MC: 34704573346 TokenAddress: 0x4Aa05f81d53C3eca3883ebD70514EBc4807c0470
        A> TICKER:solana TIK:sol TS: 1645991520 PRICE: 85.44 MC: 27345996991 TokenAddress: 0x40d613ebB3A83D9C07EE1789fD2A4981049B7d1c
        B> TICKER:0x626974636f696e00000000000000000000000000000000000000000000000000 TIK:0x6274630000000000 TS: 1645991520 PRICE: 38177 MC: 724677866780 TokenAddress: 0x2FBeAA55F64189e2195265883eDE64809C00d55B
        B> TICKER:0x657468657265756d000000000000000000000000000000000000000000000000 TIK:0x6574680000000000 TS: 1645991520 PRICE: 2645.11 MC: 316770318234 TokenAddress: 0x3F6AdcF272A46191D5f398cef2aEa1765DBb051A
        B> TICKER:0x62696e616e6365636f696e000000000000000000000000000000000000000000 TIK:0x626e620000000000 TS: 1645991520 PRICE: 364.52 MC: 61247490491 TokenAddress: 0xc9d4A59a8aE7a3E8389b02cB783e16ac94E2527d
        B> TICKER:0x726970706c650000000000000000000000000000000000000000000000000000 TIK:0x7872700000000000 TS: 1645991520 PRICE: 0.719829 MC: 34704573346 TokenAddress: 0x4Aa05f81d53C3eca3883ebD70514EBc4807c0470
        B> TICKER:0x736f6c616e610000000000000000000000000000000000000000000000000000 TIK:0x736f6c0000000000 TS: 1645991520 PRICE: 85.44 MC: 27345996991 TokenAddress: 0x40d613ebB3A83D9C07EE1789fD2A4981049B7d1c
        //*/
    //#endregion ORACLE


    // function getTokenStablePrice(bytes32 toToken) public view returns(uint) {
    const BTC_price = await dex.getTokenStablePrice("0x626974636f696e00000000000000000000000000000000000000000000000000"); 
    const ETH_price = await dex.getTokenStablePrice("0x657468657265756d000000000000000000000000000000000000000000000000"); 
    console.log(`BTC_price: `,web3.utils.fromWei(BTC_price),`  ETH_price: `,web3.utils.fromWei(ETH_price) );

    //*** ACCESSING ERC20 ***
    // const btc_erc20 = await ntt54_ERC20.at("0x2FBeAA55F64189e2195265883eDE64809C00d55B");
    // const eth_erc20 = await ntt54_ERC20.at("0x3F6AdcF272A46191D5f398cef2aEa1765DBb051A");
    // console.log(`totalSupply_btc: `,web3.utils.fromWei(await btc_erc20.totalSupply()),`  totalSupply_eth: `,web3.utils.fromWei(await eth_erc20.totalSupply()));
    // let approvedFor_BTC = await btc_erc20.allowance(factory.address, dex.address);
    // let approvedFor_ETH = await eth_erc20.allowance(factory.address, dex.address);
    // let btc_dex_balance = await btc_erc20.balanceOf(dex.address);
    // let btc_factory_balance = await btc_erc20.balanceOf(factory.address);
    // let eth_dex_balance = await eth_erc20.balanceOf(dex.address);
    // let eth_factory_balance = await eth_erc20.balanceOf(factory.address);
    // console.log(`approvedFor_BTC : `,approvedFor_BTC.toString(),`   approvedFor_ETH: `,approvedFor_ETH.toString(),`  btc_factory_balance: `,btc_factory_balance.toString(),`   btc_dex_balance: `,btc_dex_balance.toString(),`  eth_factory_balance: `,eth_factory_balance.toString(),`   eth_dex_balance: `,eth_dex_balance.toString());
    // approvedFor_BTC :  18967900000000000000000000    approvedFor_ETH:  119725348749000000000000000   btc_factory_balance:  18967900000000000000000000    btc_dex_balance:  0   eth_factory_balance:  119725348749000000000000000    eth_dex_balance:  0



    //*** FACTORY ***  TO RUN ONLY ONCE NO NEED FOR EVERY TIME
    // function approveAddress(address spender) external onlyAdmin {
    //ALL CONTRACTS HAVE THE SAME ADMIN 
//STEP 1 APPROVE DEX ADDRESS IN THE FACTORY SC SO IT HAS PERMISSION TO TRANSFER LIQUIDITY   
// await factory.approveAddress(dex.address , {from: _admin}); 
    console.log(`FINISHED APPROVING DEX TO FACTORY TO BE ABLE TO WITHDRAW LIQUIDITY`);
    //*** FACTORY *** 

    //DEX TRANSFER LIQUIDITY NOW THAT DEX IS APPROVED FROM FACTORY TO DEX
    // // function transferLiquidity(address from, bytes32[] calldata tID, bytes8[] calldata tTicker, address[] calldata tAddress, uint[] calldata tSupply) external {
    //A TEST OF ONLY 2 TOKENS
    const fromFactory = factory.address;

    // const tID     = ["0x626974636f696e00000000000000000000000000000000000000000000000000","0x657468657265756d000000000000000000000000000000000000000000000000"];
    // const tTicker = ["0x6274630000000000","0x6574680000000000"];
    // const tAddress = ["0x2FBeAA55F64189e2195265883eDE64809C00d55B","0x3F6AdcF272A46191D5f398cef2aEa1765DBb051A"];
    // const tSupply = [web3.utils.toWei("2.5"),web3.utils.toWei("10")];
    // console.log(` tSupply :`,tSupply);  // tSupply : [ '2500000000000000000', '10000000000000000000' ]

    
    let {"0":tickers, "1":tiks, "2":timestamps, "3":prices, "4":mcs, "5":tokenAddrs} = await oracle.getAllData();
    // const tID     = tickers;
    // const tTicker = tiks;
    // const tAddress = tokenAddrs;
    // let tSupply = [];
    // //We will only transfeer 1% of total supply of all tokens to our dex
    // // for (let i=0; i<3; i++)
    // for (let i=0; i<tokenAddrs.length; i++)
    // {
    //     let erc20 = await ntt54_ERC20.at(tokenAddrs[i]);
    //     let erc20_factory_balance = await erc20.balanceOf(factory.address);
    //     let erc20_transfer_balance = ( erc20_factory_balance.mul(web3.utils.toBN('1')) ).div(web3.utils.toBN('100'));
    //     console.log(`erc20_dex_balance for ${i} address:${tokenAddrs[i]} is : `,erc20_factory_balance.toString(),`  erc20_transfer_balance: `,erc20_transfer_balance.toString());
    //     tSupply.push(erc20_transfer_balance);
    // }

    
    
//STEP 2 TRANSFER LIQUIDITY TO DEX 
// await dex.transferLiquidity(fromFactory, tID, tTicker, tAddress, tSupply); 
    console.log(`WE HAVE JUST TRANSFERED LIQUIDITY`);

    // for (let i=28; i<tokenAddrs.length; i++)
    for (let i=85; i<tokenAddrs.length; i++)
    {
        let erc20 = await ntt54_ERC20.at(tokenAddrs[i]);
        let erc20_dex_balance = await erc20.balanceOf(dex.address);
        console.log(`erc20_dex_balance for ${i} address:${tokenAddrs[i]} is : `,erc20_dex_balance.toString());
    }

   

    //  btc_dex_balance = await btc_erc20.balanceOf(dex.address);
    //  btc_factory_balance = await btc_erc20.balanceOf(factory.address);
    //  eth_dex_balance = await eth_erc20.balanceOf(dex.address);
    //  eth_factory_balance = await eth_erc20.balanceOf(factory.address);
    // console.log(`btc_factory_balance: `,btc_factory_balance.toString(),`   btc_dex_balance: `,btc_dex_balance.toString(),`  eth_factory_balance: `,eth_factory_balance.toString(),`   eth_dex_balance: `,eth_dex_balance.toString());

    //#region SWAPS 

    // const STABLE_TOKENID = "0x6175736400000000000000000000000000000000000000000000000000000000";
    // const STABLE_ADDRESS = "0xE47CbE9a6D2308C93Cc20B0b42815B4cb1546A6e";
    // let client_stable_wei = await STABLE_ERC20.balanceOf(client);
    // let client_stable_balance = web3.utils.fromWei(client_stable_wei);
    // let client_btc_wei = await btc_erc20.balanceOf(client);
    // let client_btc_balance = web3.utils.fromWei(client_btc_wei);
    // let client_eth_wei = await eth_erc20.balanceOf(client);
    // let client_eth_balance = web3.utils.fromWei(client_eth_wei);
    //  console.log(`client_stable_balance:${client_stable_balance}  client_btc_balance:${client_btc_balance}  client_eth_balance:${client_eth_balance}`);
     
    //btc 0x626974636f696e00000000000000000000000000000000000000000000000000
    //eth 0x657468657265756d000000000000000000000000000000000000000000000000
    
    //A
    //***** SWAP STABLE FOR TOKEN ***** e.g. BTC 
    // function swapStableForToken(bytes32 toToken, uint amount) public tokenExists(toToken) returns(uint) {
    // let amountOfStableToSwapForToken = web3.utils.toWei("10000");
    // console.log(`Client wants to Swap ${amountOfStableToSwapForToken} for Token. NEED TO APPROVE TRANSFER OF THIS STABLE FROM CLIENT ACCOUNT TO DEX`);
    // //APPROVAL 
    // await STABLE_ERC20.approve(dex.address, amountOfStableToSwapForToken, {from: client});
    // let allowanceDexfromClient = await STABLE_ERC20.allowance(client, dex.address);
    // console.log(`allowanceDexfromClient: `,web3.utils.fromWei( allowanceDexfromClient ));
    // //SWAP
    // const amountOut = await dex.swapStableForToken("0x626974636f696e00000000000000000000000000000000000000000000000000", amountOfStableToSwapForToken); 
    // console.log(`Client receives amountOut : `,web3.utils.fromWei(amountOut));
    // let DEX_Balance_after = web3.utils.fromWei(await web3.eth.getBalance(DEXaddress));
    // let client_Balance_after   = web3.utils.fromWei(await web3.eth.getBalance(client));
    // console.log(`DEX_Balance_before:${DEX_Balance_before} DEX_Balance_after:${DEX_Balance_after} client_Balance_before:${client_Balance_before} client_Balance_after:${client_Balance_after}`);
    //#endregion SWAPS 

    done()
}