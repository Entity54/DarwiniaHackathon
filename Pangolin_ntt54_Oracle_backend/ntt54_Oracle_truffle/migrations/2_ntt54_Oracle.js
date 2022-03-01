const ntt54_Oracle = artifacts.require("ntt54_Oracle.sol");

module.exports = async function (deployer, network, accounts) {
  const [admin,price_reporter, _] = await accounts;  
  console.log(`2_ntt54_Oracle_contracts  admin: ${admin} price_reporter: ${price_reporter}`);

  await deployer.deploy(ntt54_Oracle,admin);

  // const ntt54Oracle = await ntt54_Oracle.deployed();

  // console.log(`after deployer`);
  // if (admin==="......")
  // {
  //   console.log(`account 0 ${accounts[0]}  admin: ${admin} network:${network}`);
  //   await ntt54Oracle.approvePriceReporter(price_reporter, true);
  // }
 
};
