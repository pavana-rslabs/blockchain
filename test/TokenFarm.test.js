const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
	.use(require('chai-as-promised'))
	.should()
//helper func
function tokens(n){
	return web3.utils.toWei(n, 'ether');
}	

contract('TokenFarm', ([owner, investor]) => {
	let daiToken, dappToken, tokenFarm

	before(async () => {
		//load_contracts
		daiToken = await DaiToken.new()
		dappToken = await DappToken.new()
		tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)
	// transfer all (1 million) dapp tokens to farm 
	await dappToken.transfer(tokenFarm.address,tokens('1000000'))


	//send token to investor
	await daiToken.transfer(investor, tokens('100'), { from: owner })
})
	//test
	describe('Mock DAI deployment', async () => {
		it('has a name', async() =>{
			const name = await daiToken.name()
			assert.equal(name, 'Mock DAI Token')
		})
	})
	describe('DApp token deployment', async () => {
		it('has a name', async() =>{
			const name = await dappToken.name()
			assert.equal(name, 'DApp Token')
		})
	})
	describe('Token Farm deployment', async () => {
		it('has a name', async() =>{
			const name = await tokenFarm.name()
			assert.equal(name, 'Dapp Token Farm')
		})
		it('contract has tokens', async () => {
			let balance = await dappToken.balanceOf(tokenFarm.address)
			assert.equal(balance.toString(), tokens('1000000'))
		})
	})	

	describe('Farming tokens', async () => {
		it('rewards investors for staking mDai tokens', async () => {
			let result
			// check investor balance before stakimg
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor Mock DAI allet balance correct before staking')

			// stake mock
			await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor })
			await tokenFarm.stakeTokens(tokens('100'), { from: investor})
			// check staking result
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('100'), 'Token farm mock dai balance correct after staking')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'true', 'investor mock staking status correct after staking')
		
			//issue rtoken
			await tokenFarm.issueTokens({from: owner})

			//check balance
			result = await dappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor DApp token wallet balance correct after issuance ')
			// ensuring that only owner can issue tokens
			await tokenFarm.issueTokens({ from: investor }).should.be.rejected;
		
			//unstake tokens
			await tokenFarm.unstakeTokens({ from: investor})

			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor mock dai wallet balance correct after staking')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('0'), ' Token form mock dai wallet balance after staking')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')


		})
	})

})	