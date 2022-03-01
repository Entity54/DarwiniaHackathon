const ntt54_Oracle = artifacts.require("ntt54_Oracle.sol");

module.exports = async done => {
    //state admin and reporter
    const [admin,reporter,_] = await web3.eth.getAccounts();
    console.log(`ntt54_Oracle admin: ${admin} reporter: ${reporter}`);

    //deployed sc
    const oracle = await ntt54_Oracle.deployed();

    //update tickers Only admin
    const listOfTickers = [web3.utils.utf8ToHex("Bitcoin".toLowerCase()),web3.utils.utf8ToHex("Kusama".toLowerCase()),web3.utils.utf8ToHex("Polkadot".toLowerCase())];  
    const listOfTiks = [web3.utils.utf8ToHex("BTC".toLowerCase()),web3.utils.utf8ToHex("KSM".toLowerCase()),web3.utils.utf8ToHex("DOT".toLowerCase())];  
    await oracle.updateTickers(listOfTickers, listOfTiks ,{from: admin});
    console.log(`Oracle has updated the Tickers`);

    //read tickers
    const _admin = await oracle.admin();
    const tickers_0 = await oracle.tickers(0);
    const tickers_1 = await oracle.tickers(1);
    const tickers_2 = await oracle.tickers(2);
    console.log(`ORACLE _admin: ${_admin}  tickers_0: ${tickers_0}  tickers_1: ${tickers_1} tickers_2: ${tickers_2}`);

    //approve price reporter
    await oracle.approvePriceReporter(reporter, true ,{from: admin});
    //confirm that price reporter is approved to feed prices
    const reporterApproved = await oracle.priceReporters(reporter);
    console.log(`Reporter ${reporter} is approved to update prices: `,reporterApproved);
    
    
    //Reporter Updates Prices and Market Caps
    const listOfPrices = [web3.utils.toWei((49000).toString()) ,web3.utils.toWei((500).toString()), web3.utils.toWei((55).toString())];
    const listOfMC = [1000000000000, 3000000000, 50000000000];
    console.log(`We will now update prices and mcs in Oracle`);
    await oracle.updateData(listOfPrices, listOfMC, {from: reporter})
    console.log(`We have now updated prices and mcs in Oracle`);
    
    //get data for a sing ticker
    let dataFeedback = await oracle.getData( web3.utils.utf8ToHex("Kusama".toLowerCase()) );
    console.log(`dataFeedback tickerExists 0: `,dataFeedback["0"]);
    console.log(`dataFeedback Tik          1: `, web3.utils.hexToUtf8( dataFeedback["1"] ) );
    console.log(`dataFeedback Timestamp    2: `,dataFeedback["2"].toString());
    console.log(`dataFeedback Last Price   3: `, web3.utils.fromWei( dataFeedback["3"] ));
    console.log(`dataFeedback Market Capitalisation 4: `, dataFeedback["4"].toString());
    console.log(`dataFeedback Token Address 5: `, dataFeedback["5"].toString());


    //get All Data
    let {"0":tickers, "1":tiks, "2":timestamps, "3":prices, "4":mcs, "5":tokenAddrs} = await oracle.getAllData();
    console.log(`tickers.length: ${tickers.length} timestamps.length: ${timestamps.length} prices.length: ${prices.length} mcs.length: ${mcs.length}`);
    for (let i=0; i < tickers.length; i++) {
        console.log(`TICKER:${web3.utils.hexToUtf8(tickers[i])} TIK:${web3.utils.hexToUtf8(tiks[i])} TS: ${timestamps[i]} PRICE: ${web3.utils.fromWei(prices[i])} MC: ${mcs[i]} TokenAddress: ${tokenAddrs[i]}`);
    };

    done()
}