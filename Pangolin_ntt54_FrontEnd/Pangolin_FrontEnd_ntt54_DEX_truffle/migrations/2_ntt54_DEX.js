const ntt54_DEX = artifacts.require("ntt54_DEX.sol");

module.exports = async function (deployer, network, accounts) {
  const [admin, _] = await accounts;  
  console.log(`2_ntt54_DEX  admin: ${admin}`);

  const ntt54_OracleSCAddress = "0x357C23877e32C6E01a7518F7e37d15aC338cdf0c";
  const quoteTokenID          = web3.utils.utf8ToHex( "aUSD".toLowerCase() );
  const quoteTicker           = web3.utils.utf8ToHex( "aUSD".toLowerCase() );
  const quoteInitialSupply    = web3.utils.toWei('1234567891000');
  const max_faucet_allowance  = web3.utils.toWei('100000');
  
  //NOTE IN NEXT DEPLOYMENT CORRECT THESE
  //FROM
  // const quoteInitialSupply    = web3.utils.toWei('1234567891000');
  // const max_faucet_allowance  = web3.utils.toWei('100000');
  //TO
  // const quoteInitialSupply    = 1234567891000;
  // const max_faucet_allowance  = 100000;
  //INSIDE TH SMART CONTRACT WE MULTIPLY BY 1 ether SO MISTAKENLY WE APPLY THIS TWICE AND GET NUMBERS LARGERS THAN DESIRED

  await deployer.deploy(ntt54_DEX, quoteTokenID, quoteTicker, quoteInitialSupply, ntt54_OracleSCAddress, max_faucet_allowance);
 
};
