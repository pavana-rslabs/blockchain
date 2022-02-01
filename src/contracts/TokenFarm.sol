pragma solidity 0.5.16;


import "./DaiToken.sol";

import "./DappToken.sol";


contract TokenFarm {
  string public name = "Dapp Token Farm";
  DappToken public dappToken;
  DaiToken public daiToken;
  address public owner;

  address[] public stakers;
  mapping(address => uint) public stakingBalance;
  mapping (address => bool) public hasStaked;
   mapping (address => bool) public isStaking;
  

  constructor(DappToken _dappToken, DaiToken _daiToken)public{
  	dappToken = _dappToken;
  	daiToken = _daiToken;
  	owner = msg.sender;

  }

  // 1. Stakes Tokens
  function stakeTokens(uint _amount) public {


  	require (_amount > 0, "amount cannot be 0");
  	
  	// transfer dai token to this contract for staking already

  	
  	daiToken.transferFrom(msg.sender, address(this), _amount);
  	stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;
  	// add user to stakers array if they have not staked
  	if (!hasStaked[msg.sender]){
  		stakers.push(msg.sender);

  	}

  	//update staking status
  	isStaking[msg.sender] = true;
  	hasStaked[msg.sender] = true;
  }

  //2. Unstaking Tokens
  function unstakeTokens() public {
  	uint balance = stakingBalance[msg.sender];
  	// amount to be greater than 0
  	require(balance > 0, "Staking balance cannot be 0");

  	daiToken.transfer(msg.sender, balance);

  	stakingBalance[msg.sender] = 0;

  	//update stakingbalance
  	isStaking[msg.sender] = false;

  }
  //3. Issuing tokens
  function issueTokens() public {
  	 // Only owner can call this function
        require(msg.sender == owner, "caller must be the owner");
  		for( uint i=0; i<stakers.length; i++) {
  		address recipient = stakers[i];
  		uint balance = stakingBalance[recipient];
  		if(balance > 0) {
  			dappToken.transfer(recipient, balance);
  		}
  		
  } 
  
}

}