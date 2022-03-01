# Darwinia Crab Hackathon

ALL SMART CONTRACTS ARE DEPLOYED IN THE PANGOLIN TEST NETWORK OF DARWINIA<br>
ALL TOKENS ARE MINTED IN THE TEST NETWORK PANGOLIN AND HAVE ZERO, 0, NONE ECONOMIC VALUE WHATSOEVER<br>
THESE ARE ONLY TESTING TOOLS AND SMART CONTRACTS

<h1> Oracle + Minter + Dex </h1>
 
<p>
  Our project contains 
  a) A Backend part
  b) A Frontend part
  <br>
All deployed smart contracts have the same administrator account address
 </p> 


Problem: For any development in an EVM environment (especially inside a parachain EVM) starts with some basic infrastruture needed
         Only once such an infrastructure exists a developer can start building innovative products on top of it
  
Solution: We have developped: <br>
          i) An Oracle Dapp. Collects and publishes prices for any tokens that show on coingecko website. <br>
          ii) A Minter Dapp. All tokens tracked by the oracle sc are minted to ERC20 tokens <br>
          iii) A Dex Dapp. Collects liquidity of ERC20 tokens minted by Minter. 
               Mints a stable coin. Allows any account to use the faucet to get some stable tokens which he can then swap for any of the ERC20 tokens

With an Oracle smart contract to broadcast prices, a Minter smart contract to mint ERC20 tokens and a Dex smart contract, anyone can build on top of that his/her project. Anyone can deploy any of these smart contracts.


  
 
<h2>Backend</h2>
Backend contains two parts Oracle and Minter
<h3>Oracle</h3>
We have deployed an Oracle smart contract
We are running a webserver. Anyone can run a similar webserver by typing $node server.js here <b>PLACE LINK HERE<b>
The webserver at initialization offers a basic front end and it reads basic information about available token data offered by coingecko api
Webserver front end allows to approve another account address as price reporter so it can update prices in the oracle smart contract
Automatically we have approved this address <b>SHOW ADDRESS<b> as price reporter.
The admin chooses the list of tokens from coingecko that wants the smart contract to store prices
There are some predetermined lists and in our example we use the custom list 
The custom list contains 114 tokens (the top 100 tokens by market cap as seen on coingecko page, excluding stable coins and adding most polkadot and kusama coins available at time of deployment)
It needs to be emphasized that the admin can add further tokens or remove existing ones

<h3>Minter</h3>
The second part of our backend and scrolling down from the Oracle (on the webpage as shown on the video) we can see that the admin can click and mint any tokens being tracked by the oracle smart contract that have a default 0 address,
Tokens are now minted to ERC20 tokens with a total supply equal to the circulating supply as published at coingecko website (if there is no reported cicrculating supply, we use the total supply and if this is not reported either we mint a large number of tokens)
The admin of Minter can approve any account address to withdraw any and all liquidity.
The admin of Minter is also the admin of all ERC20 tokens minted so the admin can mint , burn ERC20 tokens and also change admin of an ERC20 to another address

<h2>Frontend</h2>
The user must have chrome Metamask extension installed and logged in with a prefunded with <b>PRING</b> account to be able to pay for any transactions
Our front end has three pages<br>
<h6> Dashboard</h6> 
Token prices retrieved from the oracle smart contract are shown <br>
<h6> Portfolio</h6> 
The holdings and usd value for each of the 114 tokens we have minted, and the total portoflio value of the account chosen. This updates once every 20 blocks<br>
The user can also transfer any of his ERC20 tokens or <b>PRING</b> tokens to his friends<br>
<h6> DEX</h6>  
This is where the user can use the faucet to get some stable coins in his metamask Limit is $100,000 for the lifetime of any account<br>
Now the user can choose to swap his stable for any token he chooses from the drop down list, or if he has any tokens swap these back to stable at Oracle determined prices

<h2>Thoughts</h2>
<p>The Oracle webserver has few points of attack that could be the base for further expansion and improvement. Dex can also be improved much further</p>
<p>
Firstly, the machine running the webserver and feeding prices to the Oracle smart contract can be attacked. <br> 
One way of addressing this is the following  <br> 
Visualise 10000 individual having their account address approved by the admin. Then each one can run the webserver from his own pc.  <br> 
The oracle smart contract will have to be upgraded to get an aggregate feed from the 10,000 individual servers and also think of tokenomics and proof of staking by price reporters so that it becomes both of economic interest to the price reporters, self sufficient project and some tokenonimcs with regards to fees paid by price consumers <br> 
Now an attack will have to affect more than 51% of price reporters to the oracle smart contract
</p>
<p>
Secondly, currently the webserver grabs prices from coingecko and feeds the oracle smart contract.  <br> 
An upgrade to that would be to retrieve prices from several CEXs such as MEXC,Binance,Huobi etc. and even Dexes deployed in the parchain EVM or using XCM DEXs deployed in other parachains <br> 
An aggregate token price would be sent from each price reporter <br> 
Now an attack to any price provider centralised or decentralised, would be filtered out first at the price reporter level, running the webserver on his pc
</p>
<b>
<p>
Thirdly, currently the admin of all smart contracts is the same address. <br> 
There is the functionality in each smart contract to change the admin of each smart contract and each minted ERC20 tokens.  <br> 
For our testing purposes this is fine but in reality it would be preferable if after deployment the admin which is currently one address, changes to a DAO address.
</p>
<p>
Some Dex imporvements could be applying fees e.g. 0.30% and even artificial slippage. <br> 
Also instead of the simple formula used, one could use the x * y = k formula but this complicates unnecessarily our testing tools (e.g. write a smart contract bot that continously interacts with AMMs for all tokens, looking at Oracle smart contract prices to bring the AMMs pricing in-line with this) unless one's project is to build around that smart contract architectural design,   
<p>  
We have spent endless sleepless nights developing these tools. <br> 
Can these be improved? Of course, above are just a few of our thoughts. <br>
For the time being these offer an infrastucture to our team (and hopefully to many more teams) to use these and develop our projects while having a fairly realistic environment in the test network!!!
