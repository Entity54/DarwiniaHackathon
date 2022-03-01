// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ntt54_ERC20.sol";
import "./ntt54_Oracle.sol";


contract ntt54_DEX {

    address public admin;
    address public oracleAddress;
    bytes32 public quoteTokenID;
    uint public swapID;
    uint public max_faucet_allowance;
    

    struct Token {
        bytes32 tokenID;
        bytes8 tokenTicker;
        address tokenAddress;
    }

    struct Swap {
        uint id;
        bytes32 frmTkn;
        bytes32 toTkn;
        uint amount;
        uint price;
        uint date;
    }

    mapping(bytes32 => Token) public tokens;       //tokens[tokenID e.g. bitcoin} => {0x28398298729, "BTC", btcAdddress}
    bytes32[] public tokenIDs;
    mapping(address => uint) public faucetMinted;

    event NewSwap(uint id, bytes32 frmTkn, bytes32 toTkn, uint amountIn, uint amountOut, uint price, uint timestamp);
    event NewFaucetMint(address to, uint amount, uint timestamp);
    event Received(address sender, uint amount);

    modifier onlyAdmin() {
        require(msg.sender==admin,"only the administrator is allowed this functionality");
        _;
    }

    modifier oracleExists {
        require(oracleAddress!=address(0),"Oracle is not set up. No swaps will be permitted");
        _;
    }

    modifier tokenExists(bytes32 tokenID) {
        require(tokens[tokenID].tokenAddress!= address(0), "token ID does not exist");
        _;
    }

    
    /**
        @notice Pass the stable token id, ticker, initial supply. This stable token will be the quote currency
        @param _quoteTokenID The id of the quote currency as a bytes32
        @param _quoteTicker The ticker of the quote currency as a bytes8
        @param _quoteInitialSupply The initial supply of the quote currency.
        @param _oracleAddress The address of the oracle that will be used for price retrieval in swaps
    */
    constructor(bytes32 _quoteTokenID, bytes8 _quoteTicker, uint _quoteInitialSupply, address _oracleAddress, uint _max_faucet_allowance) {
        admin = msg.sender; 
        oracleAddress = _oracleAddress;
        max_faucet_allowance = _max_faucet_allowance * 1 ether;
        ntt54_ERC20 stableCoin = new ntt54_ERC20(string(abi.encodePacked(_quoteTokenID)), string(abi.encodePacked(_quoteTicker)), _quoteInitialSupply * 1 ether);
        quoteTokenID = _quoteTokenID;
        addToken(_quoteTokenID, _quoteTicker, address(stableCoin));
    }


    /**
        @notice only the admin account can call this function to pass ownership
        @dev we can set new admin like a multisig admin. 
        @param newAdmin The new admin of the token
    */
    function changeAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }

    
    function addToken(bytes32 tID, bytes8 tTicker, address tAddress) public onlyAdmin {
        tokens[tID] = Token({ tokenID: tID, tokenTicker: tTicker, tokenAddress: tAddress});
        tokenIDs.push(tID);
    }

    function getAllTokenIDstrings() external view returns(string[] memory) {
        string[] memory tokenIDstrings = new string[](tokenIDs.length);
        for (uint i=0; i < tokenIDs.length; i++) {
            tokenIDstrings[i] = string( abi.encodePacked(tokenIDs[i]) );
        }
        return tokenIDstrings;
    }

    function getAllTokenIDs() external view returns(bytes32[] memory) {
        return tokenIDs;
    }

    function getAllTokens() external view returns(Token[] memory) {
        Token[] memory tokensStructs = new Token[](tokenIDs.length);
        for (uint i=0; i < tokenIDs.length; i++) {
            tokensStructs[i] = tokens[ tokenIDs[i] ];      
        }
        return tokensStructs;
    }


    function faucetStable (uint _amount) external tokenExists(quoteTokenID) {
        uint amountWEI = _amount *  1 ether;
        require( faucetMinted[msg.sender] < max_faucet_allowance && amountWEI <=max_faucet_allowance ,"account has minted maximum permitted stable");
        uint leftTomint = max_faucet_allowance - faucetMinted[msg.sender] ;
        uint amountToMint =  leftTomint > amountWEI ? amountWEI : leftTomint;
        faucetMinted[msg.sender] +=amountToMint;
        ntt54_ERC20 stable = ntt54_ERC20( tokens[quoteTokenID].tokenAddress );
       
        stable.transfer(msg.sender, amountToMint);

        emit NewFaucetMint(msg.sender, amountToMint, block.timestamp);
    }



    function transferLiquidity(address from, bytes32[] calldata tID, bytes8[] calldata tTicker, address[] calldata tAddress, uint[] calldata tSupply) external {
        for (uint i=0; i< tID.length; i++) {
            IERC20 newToken = IERC20( tAddress[i] );
            newToken.transferFrom(from, address(this), tSupply[i]);
            addToken(tID[i], tTicker[i], tAddress[i]); 
        }
    }
    
    
    function getTokenStablePrice(bytes32 toToken) public view returns(uint) {
        ntt54_Oracle oracle = ntt54_Oracle(oracleAddress);
        (  ,  , , uint last_price, ,) = oracle.getData(toToken); 
        return last_price;
    }


 
    function swapStableForToken(bytes32 toToken, uint amount) public tokenExists(toToken) returns(uint) {
        IERC20 fromTkn = IERC20( tokens[quoteTokenID].tokenAddress );
        fromTkn.transferFrom(msg.sender, address(this), amount);   //msg.sender needs to have approved first fromTkn.approve(address(this), amount)
        IERC20 toTkn = IERC20(tokens[toToken].tokenAddress);

        uint price = getTokenStablePrice(toToken);
        require(price>0,"TokenStable price is 0.Token does not exist");
         
        uint amountOut = (amount * 1 ether ) / price ;
        toTkn.transfer(msg.sender, amountOut);

        swapID++;
        emit NewSwap(swapID, quoteTokenID, toToken,  amount, amountOut,  price,  block.timestamp);

        return amountOut;
    } 


    function swapTokenForStable(bytes32 fromToken, uint amount) public tokenExists(fromToken) returns(uint) {
        IERC20 fromTkn = IERC20( tokens[fromToken].tokenAddress );    
        fromTkn.transferFrom(msg.sender, address(this), amount);  //msg.sender needs to have approved first fromTkn.approve(address(this), amount)
        IERC20 toTkn = IERC20(tokens[quoteTokenID].tokenAddress);

        uint price = getTokenStablePrice(fromToken);
        require(price>0,"TokenStable price is 0.Token does not exist");
         
        uint amountOut = (amount * price) / 1 ether ;
        toTkn.transfer(msg.sender, amountOut);

        swapID++;
        emit NewSwap(swapID, fromToken, quoteTokenID,  amount, amountOut,  price,  block.timestamp);
        return amountOut;
    } 

    

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdrawContractBalance() public onlyAdmin {
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

}