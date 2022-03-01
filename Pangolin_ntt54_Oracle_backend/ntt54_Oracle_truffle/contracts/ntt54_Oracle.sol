// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

contract ntt54_Oracle {

  address public admin;
  bytes32[] public tickers;     
  uint lastUpdateBlockNum;    

  struct Data {
    bytes8 tik;
    uint timestamp;
    uint last_price;
    uint marketCap;
    address tokenAddress;
  }

  struct Ticker {
    bool active;
    uint index;
  }

  mapping(address => bool) public priceReporters;
  mapping(bytes32 => Data) data;

  //e.g. activeTicker["bitcoin"] => true,2 if we are tracking this and is in 3rd place in the tickers array
  mapping(bytes32 => Ticker) public activeTicker;    

  constructor(address _admin) {
    admin = _admin;
  }

  modifier onlyAdmin {
    require(msg.sender==admin,"only the administrator can do this operation");
    _;
  }

  function getLastUpdateBlockNum() public view returns(uint) {
    return lastUpdateBlockNum;
  }

  function _setLastUpdateBlockNum(uint _lastUpdateBlockNum) private {
    lastUpdateBlockNum = _lastUpdateBlockNum;
  }

  function getTickers() public view returns(bytes32[] memory) {
    return tickers;
  }
 
  function approvePriceReporter(address price_reporter, bool approved) external onlyAdmin {
    priceReporters[price_reporter] = approved;
  }

  function updateTickers(bytes32[] calldata _tickers, bytes8[] calldata _tiks) external onlyAdmin{
    require(_tickers.length > 0 && _tickers.length == _tiks.length,"the tickers array passed has length 0 OR different size to _tiks arrays");
   
    for (uint i=0; i < _tickers.length; i++ )
    {
      if (activeTicker[_tickers[i]].active == false)
      {
        activeTicker[_tickers[i]].active = true;
        activeTicker[_tickers[i]].index = tickers.length;
        tickers.push(_tickers[i]);
        data[_tickers[i]].tik = _tiks[i];
      }
    }

  }

  function updateTokenAddresses(bytes32[] calldata _tickers, address[] calldata _addresses) external onlyAdmin  {
    require(_addresses.length > 0 && _tickers.length == _addresses.length,"The _addresses array passed has length 0 or is not of the same length as the _tickers");
   
    for (uint i=0; i < _addresses.length; i++ )
    {
      if (activeTicker[_tickers[i]].active == true)
      {
        data[_tickers[i]].tokenAddress = _addresses[i];
      }
    }
     
  }

  function removeTicker(bytes32 _removeTicker) external onlyAdmin {
      if (activeTicker[_removeTicker].active == true)
      {
        activeTicker[_removeTicker].active = false;
        uint newIndex = activeTicker[_removeTicker].index;  
        tickers[newIndex] = tickers[tickers.length-1];
        activeTicker[ tickers[newIndex] ].index = newIndex;
        tickers.pop();
        delete data[_removeTicker];
      }
  }

  function updateData(uint[] memory prices, uint[] memory mcs) public {
    require(priceReporters[msg.sender]==true,"Only a Price Reporter can update prices");
    require(tickers.length==prices.length && tickers.length==mcs.length,"Tickers Prices and MCs array must all have the same length");
    
    _setLastUpdateBlockNum(block.number);
    uint blockTimestamp = block.timestamp;
    
    for(uint i=0; i < tickers.length; i++) {
      data[tickers[i]].timestamp  = blockTimestamp;
      data[tickers[i]].last_price = prices[i];
      data[tickers[i]].marketCap  = mcs[i];
    }

  }

  function getData(bytes32 ticker) public view returns(bool tickerExists, bytes8 tik, uint timestamp, uint last_price, uint marketCap, address tokenAddress) {
    if (data[ticker].timestamp==0) {
      return(false, "", 0, 0, 0, address(0));
    }
    
    return (true, data[ticker].tik, data[ticker].timestamp, data[ticker].last_price, data[ticker].marketCap, data[ticker].tokenAddress);
  }

  function getAllData() public view returns(bytes32[] memory, bytes8[] memory, uint[] memory, uint[] memory, uint[] memory, address[] memory) {
      uint tickerLength = tickers.length;
      require(tickerLength > 0,"There are no data to retrieve");
      bytes8[] memory tiks = new bytes8[](tickerLength);
      uint[] memory timestamp = new uint[](tickerLength);
      uint[] memory prices = new uint[](tickerLength);
      uint[] memory mcs = new uint[](tickerLength);
      address[] memory tokenAddresses = new address[](tickerLength);

      bytes32 ticker;
      for (uint i=0; i < tickerLength; i++) {
        ticker = tickers[i];
        tiks[i] =  data[ticker].tik;
        timestamp[i] =  data[ticker].timestamp;
        prices[i] = data[ticker].last_price;
        mcs[i] = data[ticker].marketCap;
        tokenAddresses[i] = data[ticker].tokenAddress;
      }

      return(tickers,tiks,timestamp,prices,mcs,tokenAddresses);
  }

 
}