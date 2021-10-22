/*global contract, artifacts, before, web3, assert*/

const { assert } = require('chai')
const Exchange = artifacts.require('ExchangeLicEth')
const LibertyCoin = artifacts.require('LibertyCoin')
require('chai').use(require('chai-as-promised')).should()

function etherToWei (n, toInt = false) {
    if (typeof(n) !== 'string') {
        n = n.toString()
    }

    const value = web3.utils.toWei(n, 'ether')

    if (toInt) {
        return parseInt(value)
    }
    return value
}

function weiToEther (n, toInt = false) {
    if (typeof(n) !== 'string') {
        n = n.toString()
    }

    const value = web3.utils.fromWei(n, 'ether')

    if (toInt) {
        return parseInt(value)
    }
    return value
}

contract('Test ExchangeLicEth.sol', async (accounts) => {

    // Test consts
    const buyer = accounts[0]
    const ethersUsedToBuyLic = 2
    const EthToLicRateOverright = 5
    const licAmountToSellOverrideRate = ethersUsedToBuyLic * EthToLicRateOverright

    // Test variables from contracts
    let LicTotalSupply
    let EthToLicRateDefault
    let licAmountToSellNormalRate

    console.log('  => Accounts: ', accounts)

    let ExchangeInstance
    before(async () => {
        // Deploy contracts
        LibertyCoinInstance = await LibertyCoin.new()
        ExchangeInstance = await Exchange.new(LibertyCoinInstance.address)
        console.log('    => Exchange address:', ExchangeInstance.address)

        // Get LIC total suply of LIC tokens, in ether as NUMBER
        LicTotalSupply = await LibertyCoinInstance.totalSupply.call()
        LicTotalSupply = weiToEther(LicTotalSupply, true)

        // Get default exchange rate
        EthToLicRateDefault = await ExchangeInstance.rate.call()
        EthToLicRateDefault = parseInt(EthToLicRateDefault)
        licAmountToSellNormalRate = ethersUsedToBuyLic * EthToLicRateDefault
        
        // Initial transfer of LIC to Exchange address
        await LibertyCoinInstance.transfer(ExchangeInstance.address, etherToWei(LicTotalSupply))
    })

    describe('\n\r    * ExchangeLicEth deployment', async () => {

        it('Contract has address', async () => {
            assert.equal(ExchangeInstance.address.length, 42)
        })
        
        it('Contract has a name', async () => {
            const name = await ExchangeInstance.name()
            assert.equal(name, 'ExchangeLicEth')
        })

        it('Contract has LIC balance', async () => {
            const balance = await LibertyCoinInstance.balanceOf(ExchangeInstance.address)
            assert.equal(balance.toString(), etherToWei(LicTotalSupply))
        })

    })

    describe('\n\r    * Method buyTokens()', async () => {

        let result
        before(async () => { 
            // Execute a buy transaction
            result = await ExchangeInstance.buyTokens({ 
                from: buyer,
                value: etherToWei(ethersUsedToBuyLic)
            })
        })

        it('User can purchase LIC for ETH', async () => {
            const buyerLicBalance = await LibertyCoinInstance.balanceOf(buyer)
            assert.equal(
                buyerLicBalance.toString(), 
                etherToWei(ethersUsedToBuyLic * EthToLicRateDefault), 
                'Buyer has wrong amount of LIC balance after trade'
            )
            
            const exchangeInstanceLicBalance = await LibertyCoinInstance.balanceOf(ExchangeInstance.address)
            assert.equal(
                exchangeInstanceLicBalance.toString(), 
                etherToWei(LicTotalSupply - (ethersUsedToBuyLic * EthToLicRateDefault)),
                'Exchange contract has wrong amount of LIC balance after trade'
            )

            const exchangeInstanceEthBalance = await web3.eth.getBalance(ExchangeInstance.address)
            assert.equal(
                exchangeInstanceEthBalance.toString(), 
                etherToWei(ethersUsedToBuyLic),
                'Exchange contract has wrong amount of ETH balance after trade'
            )

            const event = result.logs[0].args
            assert.equal(event.account, buyer, 'Event check - wrong buyer address')
            assert.equal(event.token, LibertyCoinInstance.address, 'Event check - wrong contract address')
            assert.equal(event.amount.toString(), etherToWei(ethersUsedToBuyLic * EthToLicRateDefault).toString(), 'Event check - wrong amount of LIC')
            assert.equal(event.rate.toString(), String(EthToLicRateDefault), 'Event check - wrong rate used')
        })
    })

    describe('\n\r    * Method sellTokens()', async () => {
        
        let result
        before(async () => { 
            // Execute a sell transaction
            await LibertyCoinInstance.approve(
                ExchangeInstance.address,
                etherToWei(licAmountToSellNormalRate),
                { from: buyer }
            )
            result = await ExchangeInstance.sellTokens(etherToWei(licAmountToSellNormalRate), { from: buyer })
        })

        it('User can sell LIC for ETH', async () => {
            const buyerLicBalance = await LibertyCoinInstance.balanceOf(buyer)
            assert.equal(
                buyerLicBalance.toString(), 
                etherToWei('0'),
                'Seller has wrong amount of LIC balance after trade'
            )

            const exchangeInstanceLicBalance = await LibertyCoinInstance.balanceOf(ExchangeInstance.address)
            assert.equal(
                exchangeInstanceLicBalance.toString(), 
                etherToWei(LicTotalSupply),
                'Exchange contract has wrong amount of LIC balance after trade'
            )

            const exchangeInstanceEthBalance = await web3.eth.getBalance(ExchangeInstance.address)
            assert.equal(
                exchangeInstanceEthBalance.toString(),
                etherToWei('0'),
                'Exchange contract has wrong amount of ETH balance after trade'
            )

            const event = result.logs[0].args
            assert.equal(event.account, buyer, 'Event check - wrong buyer address')
            assert.equal(event.token, LibertyCoinInstance.address, 'Event check - wrong contract address')
            assert.equal(event.amount.toString(), etherToWei(ethersUsedToBuyLic * EthToLicRateDefault).toString(), 'Event check - wrong amount of LIC')
            assert.equal(event.rate.toString(), String(EthToLicRateDefault), 'Event check - wrong rate used')
        })

        it('User cannot sell more LIC than have', async () => {
            await ExchangeInstance.sellTokens(etherToWei(LicTotalSupply+1), { from: buyer }).should.be.rejected;
        })
    })

    describe('\n\r    * Method setRate()', async () => {

        let result
        before(async () => { 
            // Execute a buy transaction
            result = await ExchangeInstance.setRate(EthToLicRateOverright)
        })

        it('User can overright default rate of value to exchange LIC for ETH', async () => {
            const ethToLicRateCurrent = await ExchangeInstance.getRate()
            assert.equal(
                EthToLicRateOverright, 
                ethToLicRateCurrent, 
                'Contract rate did not override correctly'
            )
        })
    })

    describe('\n\r    * Method buyTokens() with overrided rate', async () => {

        let result
        before(async () => { 
            // Execute a buy transaction
            result = await ExchangeInstance.buyTokens({ 
                from: buyer,
                value: etherToWei(ethersUsedToBuyLic)
            })
        })

        it('User can purchase LIC for ETH', async () => {
            const buyerLicBalance = await LibertyCoinInstance.balanceOf(buyer)
            assert.equal(
                buyerLicBalance.toString(), 
                etherToWei(ethersUsedToBuyLic * EthToLicRateOverright), 
                'Buyer has wrong amount of LIC balance after trade'
            )
            
            const exchangeInstanceLicBalance = await LibertyCoinInstance.balanceOf(ExchangeInstance.address)
            assert.equal(
                exchangeInstanceLicBalance.toString(), 
                etherToWei(LicTotalSupply - (ethersUsedToBuyLic * EthToLicRateOverright)),
                'Exchange contract has wrong amount of LIC balance after trade'
            )

            const exchangeInstanceEthBalance = await web3.eth.getBalance(ExchangeInstance.address)
            assert.equal(
                exchangeInstanceEthBalance.toString(), 
                etherToWei(ethersUsedToBuyLic),
                'Exchange contract has wrong amount of ETH balance after trade'
            )

            const event = result.logs[0].args
            assert.equal(event.account, buyer, 'Event check - wrong buyer address')
            assert.equal(event.token, LibertyCoinInstance.address, 'Event check - wrong contract address')
            assert.equal(event.amount.toString(), etherToWei(ethersUsedToBuyLic * EthToLicRateOverright).toString(), 'Event check - wrong amount of LIC')
            assert.equal(event.rate.toString(), String(EthToLicRateOverright), 'Event check - wrong rate used')
        })
    })

    describe('\n\r    * Method sellTokens() with overrided rate', async () => {
        
        let result
        before(async () => { 
            // Execute a sell transaction
            await LibertyCoinInstance.approve(
                ExchangeInstance.address,
                etherToWei(licAmountToSellOverrideRate),
                { from: buyer }
            )
            result = await ExchangeInstance.sellTokens(etherToWei(licAmountToSellOverrideRate), { from: buyer })
        })

        it('User can sell LIC for ETH', async () => {
            const buyerLicBalance = await LibertyCoinInstance.balanceOf(buyer)
            assert.equal(
                buyerLicBalance.toString(), 
                etherToWei('0'),
                'Seller has wrong amount of LIC balance after trade'
            )

            const exchangeInstanceLicBalance = await LibertyCoinInstance.balanceOf(ExchangeInstance.address)
            assert.equal(
                exchangeInstanceLicBalance.toString(), 
                etherToWei(LicTotalSupply),
                'Exchange contract has wrong amount of LIC balance after trade'
            )

            const exchangeInstanceEthBalance = await web3.eth.getBalance(ExchangeInstance.address)
            assert.equal(
                exchangeInstanceEthBalance.toString(),
                etherToWei('0'),
                'Exchange contract has wrong amount of ETH balance after trade'
            )

            const event = result.logs[0].args
            assert.equal(event.account, buyer, 'Event check - wrong buyer address')
            assert.equal(event.token, LibertyCoinInstance.address, 'Event check - wrong contract address')
            assert.equal(event.amount.toString(), etherToWei(ethersUsedToBuyLic * EthToLicRateOverright).toString(), 'Event check - wrong amount of LIC')
            assert.equal(event.rate.toString(), String(EthToLicRateOverright), 'Event check - wrong rate used')
        })

    })

})