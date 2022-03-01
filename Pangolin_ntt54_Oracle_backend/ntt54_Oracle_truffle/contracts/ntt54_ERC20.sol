// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

///@title Creation of an ERC20 
///@author ntt54
contract ntt54_ERC20 is ERC20 {
    
    address public admin;

    modifier onlyAdmin {
        require(msg.sender==admin, "only admin is allowed this functionality");
        _;
    }

    /** 
        @dev set the admin, name and symbol of token. optionally set the intial supply to be minted to admin
        @param name Name of ERC20 
        @param symbol Ticker of ERC20 
        @param initialSupply The intial supply of ERC20 
    */
    constructor(string memory name, string memory symbol, uint initialSupply) ERC20(name,symbol)  {
        admin = msg.sender;

        if (initialSupply!=0)
        {
            _mint(msg.sender, initialSupply);     
        }
    }

    /**
        @notice only the admin account can call this function to pass ownership
        @dev set new admin like a multisig admin. 
        @param newAdmin The new admin of the token
    */
    function changeAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }

    /**
        @notice Only the admin account can mint new tokens
        @dev mint new tokens. 
        @param to The address to mint the new tokens to
        @param amount Then number of new tokens to mint
    */
    function mint(address to, uint amount) external onlyAdmin {
        _mint(to, amount);
    }

    /**
        @notice Only the admin account can burn tokens and only tokens owned by admin
        @dev burn tokens that admin owns
        @param amount Then number of tokens to burn
    */
    function burn(uint amount) external onlyAdmin {
        _burn(admin, amount);
    }
     
}