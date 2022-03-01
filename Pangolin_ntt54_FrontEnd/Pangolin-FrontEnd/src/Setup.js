import { ethers } from 'ethers';  
import detectEthereumProvider from '@metamask/detect-provider'; // FOR METAMASK TO BE USED This function detects most providers injected at window.ethereum

const setup = async (network = "pangolin", useMetaMask=true) => {

      let provider, wallet, wss_provider=null, mm_acounts;
      //#region SETUP PROVIDER AND WALLET WITH METAMASK 
      if (useMetaMask)
      {
        const _provider = await detectEthereumProvider();
        if (_provider) {
          provider = new ethers.providers.Web3Provider(window.ethereum, "any");   
          provider.on("network", (newNetwork, oldNetwork) => {
              if (oldNetwork) {
                  window.location.reload();
              }
          });

          mm_acounts = await _provider.request({ method: 'eth_requestAccounts' });
          console.log(`MetaMask Accounts: `,mm_acounts);
          const account = mm_acounts[0];
          const mm_chainId = await _provider.request({ method: 'eth_chainId' });
          console.log(`MetaMask mm_chainId: `,mm_chainId);
        
          wallet = provider.getSigner(); 

          return { provider, wallet, account,  };
        } 
        else { 
          console.log('Please install MetaMask!'); 
          return { provider: null, wallet: null, account: null };
        }
      }
      //#endregion SETUP PROVIDER AND WALLET WITH METAMASK  
}

export {setup};