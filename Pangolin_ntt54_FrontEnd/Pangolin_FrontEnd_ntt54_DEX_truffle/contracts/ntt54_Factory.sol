// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ntt54_ERC20.sol";


///@title A factory to mint ERC20 tokens
///@author ntt54
contract ntt54_Factory {

    address public admin;
    struct Token {
        bytes32 tokenID;
        bytes8 tokenTicker;
        uint tokenSupply;
        address tokenAddress;
    }

    mapping(bytes32 => Token) public tokens;       //tokens[tokenID e.g. bitcoin in bytes32} => {0x28398298729, "BTC",1000,0x28358253}
    bytes32[] public tokenIDs;

     
    modifier onlyAdmin {
        require(msg.sender==admin,"only admin is allowed this functionality");
        _;
    }

    constructor (address _admin) {
        admin = _admin;
    }


    /// @notice Get an array with all tokens. Each element is a struct with tokenID, tokenTicker, tokenSupply, tokenAddress.
    function getAllTokens() external view returns(Token[] memory) {
        Token[] memory tokensStructs = new Token[](tokenIDs.length);
        for (uint i=0; i < tokenIDs.length; i++) {
            tokensStructs[i] = tokens[ tokenIDs[i] ];      
        }
        return tokensStructs;
    }
    
    /**
        @notice Mint a list of ERC20 tokens. A token can only be minted once.
        @param names Array of names in bytes32 of ERC20 tokens to be minted
        @param tickers Array of tickers in bytes8 of ERC20 tokens to be minted
        @param initialSupply Array of initial supply of ERC20 tokens to be minted
    */
    function initialERC20Mint (bytes32[] memory names, bytes8[] memory tickers, uint[] memory initialSupply ) external onlyAdmin {
        require(names.length == tickers.length && names.length == initialSupply.length, "arrays of names,tickers,initialSupply must have the same length");

        for (uint i=0; i < names.length; i++)
        {
            if (tokens[names[i]].tokenAddress == address(0)) 
            {
                ntt54_ERC20 newERC20 = new ntt54_ERC20(string(abi.encodePacked(names[i])), string(abi.encodePacked(tickers[i])), initialSupply[i] );
                tokens[names[i]] = Token({tokenID: names[i], tokenTicker: tickers[i], tokenSupply: initialSupply[i] , tokenAddress: address(newERC20) }) ;
                tokenIDs.push( names[i] );
            }

        }

    }

    /**
        @notice Change the administrator of an ERC20 if this contract is the admin of that token. Useful if initial supply is minted to this contract 
        @param newAdmin This will be the new admin of ERC20 token.
        @param tokID The token ID 
    */
    function changeAdminOfERC20 (address newAdmin, bytes32 tokID) external onlyAdmin {
        require( tokens[tokID].tokenAddress != address(0),"token does not exist");

        ntt54_ERC20 token = ntt54_ERC20( tokens[tokID].tokenAddress );
        if (token.admin()== address(this) && newAdmin!=address(this))
        {
            token.changeAdmin(newAdmin);
        }
    }

    /**
        @notice Approve an address to be able to transfer all balance for all tokens
        @param spender Spender address will be able to withdraw all balance or all tokens.
    */
    function approveAddress(address spender) external onlyAdmin {
        for (uint i=0; i < tokenIDs.length; i++)
        {
            ntt54_ERC20 token = ntt54_ERC20( tokens[ tokenIDs[i] ].tokenAddress );
            uint balance = token.balanceOf(address(this));
            if (balance > 0) 
            {
                token.approve(spender, balance);
            }
        }
    }

}


