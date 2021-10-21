/*global contract, artifacts, before, web3, assert*/

const { assert } = require('chai')
const Exchange = artifacts.require('ExchangeLicEth')
require('chai').use(require('chai-as-promised')).should()

function etherToWei (n) {
    return web3.utils.toWei(n, 'ether')
}

function weiToEther (n) {
    return web3.utils.fromWei(n, 'ether')
}

contract('Test ExchangeLicEth.sol', async (accounts) => {

    console.log('  => Accounts: ', accounts)

    let Exchange
    before(async () => {
        Exchange = await Exchange.new()
        console.log('    => Exchange address:', Exchange.address)
    })

    describe('\n\r    * ExchangeLicEth deployment', async () => {
        
        it('Contract has a name', async () => {
            const name = await Exchange.name()
            assert.equal(name, 'ExchangeLicEth')
        })

    })

})