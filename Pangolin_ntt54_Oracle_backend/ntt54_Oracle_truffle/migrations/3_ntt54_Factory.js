const ntt54_Factory = artifacts.require("ntt54_Factory.sol");

module.exports = async function (deployer, network, accounts) {
  const [admin, _] = await accounts;  
  console.log(`3_ntt54_Factory  admin: ${admin}`);

  await deployer.deploy(ntt54_Factory,admin);
};
