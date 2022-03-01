const axios = require('axios');
const fs = require('fs');
let socket = {};                                                     
// const moment = require('moment');


//Custom Lists of Tokens
const polkadot_Tickers = ["acala","moonbeam","astar","clover-finance","efinity","darwinia-network-native-token","litentry","polkadex"];
const polkadot_tiks    = ["aca"  ,"glmr"    ,"astr" ,"clv"           ,"efi"    ,"ring"                         ,"lit"     ,"pdex"    ];   //"PARA","LAYR","CFG","HDX","INTR","EQ","NODL","MANTA"

const kusama_Tickers = ["kusama","karura","moonriver","shiden","darwinia-crab-network","pha","bifrost-native-coin","kilt-protocol","kintsugi","genshiro","sakura","robonomics-network","calamari-network","crust-network","integritee","sora"];
const kusama_tiks =    ["ksm"   ,"kar"   ,"mvr"      ,"sdn"   ,"crab"                 ,"pha","bnc"                ,"kilt"         ,"kint"    ,"gens"    ,"sku"   ,"xrt"               ,"kma"             ,"cru"          ,"teer"      ,"xor" ];  //"sub","mgx","pchu","amas", "hko","","air","","neer","qtz","pica","ztg","lit","kico"
const fantom_Tickers = [];
const solana_Tickers = [];
const cosmos_Tickers = [];
const cardano_Tickers = [];
const exclusionfromMC_Tickers = ["wrapped-bitcoin","staked-ether","compound-ether","cdai","magic-internet-money","compound-usd-coin","huobi-btc","bitcoin-cash-sv","eos"];

//only used for minting sc
let marketStats = { 
  cgTickers: [],
  fully_diluted_valuation: [], 
  total_volume: [], 
  price_change_percentage_24h: [], 
  circulating_supply: [], 
  total_supply: [], 
}


//TO STORE CATEGORIES IDS, TOKEN IDS, STABLECOINS, CUSTOM LIST
let coingeckoTickersList=[],CG_categoriesIDs = [],stableCoins = [];
let monitoring_IDs = [], monitoringData = [];
let customList_IDs = [], customID_URLstring = "", customList = [];
let mc_top100_IDs = [],  mc_top100_tiks = [], mc_top100 = [];

const groupedTickers = { mc_top100_Tickers: mc_top100_IDs, polkadot_Tickers, kusama_Tickers, fantom_Tickers, cardano_Tickers, solana_Tickers, cosmos_Tickers, };
const groupedTiks = { mc_top100_tiks, kusama_tiks, polkadot_tiks };


//#region To Run at initiation only
const get_CoinGecko_CoinsTickersList = async () => {
  const baseURL = "https://api.coingecko.com/api/v3/coins/list";

  await axios.get(baseURL)
     .then((response) => {
       coingeckoTickersList = response.data;  
      //  console.log(`coingeckoTickersList: `,coingeckoTickersList);  //schema  { id: '01coin', symbol: 'zoc', name: '01coin' },
     })
     .catch((er) => {
       console.log(`Something has gone wrong trying to retrieve Coingecko Tickers List Error: ${er}`);
     });

}

const get_CoinGecko_Categories = async () => {
  const baseURL = "https://api.coingecko.com/api/v3/coins/categories/list";

  await axios.get(baseURL)
     .then((response) => {
       let dataJSON = response.data;    
       
       dataJSON.forEach((categ) => {
          CG_categoriesIDs.push(categ.category_id);
       })

      //  console.log(`CG_categoriesIDs: `,CG_categoriesIDs);
     })
     .catch((er) => {
       console.log(`Something has gone wrong trying to retrieve Coingecko categories Error: ${er}`);
     });

}

const get_Stablecoins = async () => {
  const baseURL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=stablecoins&order=market_cap_desc&per_page=100&page=1&sparkline=false";

  await axios.get(baseURL)
     .then((response) => {
       let dataJSON = response.data;    
       
       dataJSON.forEach((coin) => {
        stableCoins.push(coin.id);
       })

      //  console.log(`StableCoins: `,stableCoins);
     })
     .catch((er) => {
       console.log(`Something has gone wrong trying to retrieve Coingecko stablecoins Error: ${er}`);
     });

}

//specify what ids from a custom list are not included in the top 100 MC request
const transformSymbolToID = (symbolArray => {
  //keep only tickers in the symbolArray
  const custom_coinsList = coingeckoTickersList.filter( item => symbolArray.includes(item.id.toLowerCase()) );

  //retrieved ids  //schema  { id: '01coin', symbol: 'zoc', name: '01coin' }
  customList_IDs = custom_coinsList.map( item => item.id);

  //keep ids that are not in the mc_top100_IDs
  customList_IDs = customList_IDs.filter( id => !mc_top100_IDs.includes(id) );

  //build custom request for the ids not in top100
  customID_URLstring = "";
  customList_IDs.forEach(symb_ID => {
    customID_URLstring = customID_URLstring + symb_ID + "%2C";
  });
  customID_URLstring = customID_URLstring.substring(0,customID_URLstring.length-3);

  //update all monitoring ids
  monitoring_IDs = [...mc_top100_IDs,...customList_IDs]
});
//#endregion To Run at initiation only


//limited to top100 to contain fees
const get_TOP100_MC = async (counter=100) => {
  const baseURL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";

  await axios.get(baseURL)
     .then((response) => {
       const coin = response.data;    
       mc_top100_IDs= []; mc_top100 = []; mc_top100_tiks=[];

       for (let i=0; i < Math.min(counter,coin.length); i++ )
       {
          if (!stableCoins.includes(coin[i].id) && !exclusionfromMC_Tickers.includes(coin.id))
          {
            mc_top100_IDs.push(coin[i].id);
            mc_top100_tiks.push(coin[i].symbol);
            mc_top100.push(coin[i]);
          }

       } 

      //  console.log(`mc_top100_IDs: `,mc_top100_IDs);
     })
     .catch((er) => {
       console.log(`Something has gone wrong trying to retrieve TOP100 by market cap coins Error: ${er}`);
     });

}


const get_CustomSymbolData = async () => {
  const baseURL = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${customID_URLstring}&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
  await axios.get(baseURL)
     .then((response) => {
          customList = [];
          response.data.forEach((coin) => {
              customList.push(coin);
          });

          // console.log(`customList.length:${customList.length} customList: `,customList);
     })
     .catch((er) => {
       console.log(`Something has gone wrong trying to retrieve customlist coins Error: ${er}`);
     });

}



let coingecko_Initiation = async () => {
  console.log(`coingecko_Initiation process is running`);
  await get_CoinGecko_CoinsTickersList();     
  await get_CoinGecko_Categories();           
  await get_Stablecoins();  
  await get_TOP100_MC();  

  groupedTickers.mc_top100_Tickers = mc_top100.map(coin => coin.id.toLowerCase());
  groupedTiks.mc_top100_tiks = mc_top100.map(coin => coin.symbol.toLowerCase());

  socket.emit('coinGecko_setup',{
        createdAt: new Date().getTime()
  });
}


let getCryptoData = async (_oracleTickersArray) => {
  await get_TOP100_MC();
  transformSymbolToID(_oracleTickersArray); //find what tickers are not included in top100 so create the custom request
  await get_CustomSymbolData();             
  monitoringData = [...mc_top100,...customList];

  let cgTickers=[], fully_diluted_valuation=[], total_volume = [], price_change_percentage_24h=[], circulating_supply=[], total_supply=[];
  let prices =[], mcs=[];

  if (_oracleTickersArray.length>0)
  {
    for (let i=0; i < _oracleTickersArray.length; i++) {
        
        const tickObj = monitoringData.find( item => item.id.toLowerCase() === _oracleTickersArray[i].toLowerCase() );
        if (tickObj)
        {
          prices.push(tickObj.current_price);
          mcs.push(tickObj.market_cap);

          //gathered but only partially used circulating_supply
          cgTickers.push(_oracleTickersArray[i]);
          fully_diluted_valuation.push(tickObj.fully_diluted_valuation);
          total_volume.push(tickObj.total_volume);
          price_change_percentage_24h.push(tickObj.price_change_percentage_24h);
          let c_supply;
          if (tickObj.circulating_supply) c_supply = tickObj.circulating_supply;
          else if (tickObj.total_supply) c_supply = tickObj.total_supply;
          else c_supply = 1234567890;
          circulating_supply.push(c_supply);
          total_supply.push(tickObj.total_supply);

        }
        else {
          prices.push(0); mcs.push(0);  
          console.log(`TICKER ${_oracleTickersArray[i].toLowerCase()} at index i:${i} was not found in the retrieved data from Coingecko`);
        }
    }

    marketStats = { cgTickers, fully_diluted_valuation, total_volume, price_change_percentage_24h, circulating_supply, total_supply,};
  }

  const dataSnapshot = {_oracleTickersArray, mcs, prices, };


  // fs.appendFile(filePath, JSON.stringify(dataSnapshot), (err) => {
  // const filePath = `./data/coingecko_${moment.utc().toISOString()}.txt`;   //'2019-02-11T00:00:00.000Z'
  const filePath = `./data/coingecko_snapshot.txt`;    
  fs.writeFile(filePath, JSON.stringify(dataSnapshot), (err) => {
    if (err) throw err;
    console.log(`The data_snapshot from coingecko has been saved as a JSON file at : ${filePath}`);
  });

  // socket.emit('quotes',{
  //           ticks : monitoringData,
  //           createdAt: new Date().getTime()
  // });

  return dataSnapshot;
}


let setSocket = (frontEndSocket) => { socket = frontEndSocket; };

module.exports = {
        setSocket,
        coingecko_Initiation,
        transformSymbolToID,
        getCryptoData,
        groupedTickers,
        groupedTiks,
        marketStats: () => marketStats,
}