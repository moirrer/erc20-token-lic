/*global contract, artifacts, before, web3, assert*/

const { assert } = require('chai')
const LibertyCoin = artifacts.require('LibertyCoin')
require('chai').use(require('chai-as-promised')).should()

function etherToWei (n) {
    return web3.utils.toWei(n, 'ether')
}

function weiToEther (n) {
    return web3.utils.fromWei(n, 'ether')
}

contract('Test LibertyCoin.sol', async (accounts) => {

    console.log('  => Accounts: ', accounts)

    let LIC
    before(async () => {
        LIC = await LibertyCoin.new()
        console.log('    => LIC address:', LIC.address)
    })

    describe('\n\r    * LibertyCoin deployment', async () => {
        
        it('Contract has a name', async () => {
            const name = await LIC.name()
            assert.equal(name, 'LibertyCoin')
        })

    })

    describe('\n\r    * Check LIC balances', async () => {

        let firstAccount
        let secondAccount
        before(async () => { 
            firstAccount = accounts[0]
            secondAccount = accounts[1]
        })

        it('Balance of first account bigger than 0', async () => {
            let balance = await LIC.balanceOf(firstAccount)
            balance = balance.toString()

            assert.notEqual(balance, null, 'Balance not null')
            assert.notEqual(balance, undefined, 'Balance not undefined')
            assert.notEqual(balance, 0, 'Balance not 0')
            assert.ok(balance > 0, 'Balance is bigger than 0')

            console.log('      => firstAccount balance:', parseInt(weiToEther(balance)))
        })

        it('Balance of second account equals to 0', async () => {
            let balance = await LIC.balanceOf(secondAccount)
            balance = balance.toString()

            assert.notEqual(balance, null, 'Balance not null')
            assert.notEqual(balance, undefined, 'Balance not undefined')
            assert.equal(balance, 0, 'Balance is 0')

            console.log('\n\r', '     => secondAccount balance:', parseInt(weiToEther(balance)))
        })
    })

    describe('\n\r    * Transfer LIC', async () => {

        let firstAccount
        let secondAccount
        before(async () => { 
            firstAccount = accounts[0]
            secondAccount = accounts[1]
        })

        it('Transfer 1 LIC from first account to second account', async () => {

            const firstAccountInitialBalance = await LIC.balanceOf(firstAccount)
            const secondAccountInitialBalance = await LIC.balanceOf(secondAccount)
            const amountToTransfer = etherToWei('1')

            const result = await LIC.transfer(secondAccount, amountToTransfer, { from: firstAccount })
            
            const event = result.logs[0].args
            assert.equal(event._from, firstAccount, 'Transfered from first account')
            assert.equal(event._to, secondAccount, 'Transfered to second account')
            assert.equal(event._value.toString(), amountToTransfer, 'Transfered correct amount')

            const firstAccountNewBalance = await LIC.balanceOf(firstAccount)
            const secondAccountNewBalance = await LIC.balanceOf(secondAccount)
            
            assert.equal(
                parseInt(firstAccountNewBalance.toString()), 
                parseInt(firstAccountInitialBalance.toString()) - parseInt(amountToTransfer), 
                'First account has correct balance after transfer'
            )
            assert.equal(
                parseInt(secondAccountNewBalance.toString()), 
                parseInt(secondAccountInitialBalance.toString()) + parseInt(amountToTransfer), 
                'Second account has correct balance after transfer'
            )

            console.log('      => firstAccountNewBalance balance:', parseInt(weiToEther(firstAccountNewBalance)))
            console.log('      => secondAccountNewBalance balance:', parseInt(weiToEther(secondAccountNewBalance)))
        })

        it('Transfer 10 LIC from first account to second account', async () => {

            const firstAccountInitialBalance = await LIC.balanceOf(firstAccount)
            const secondAccountInitialBalance = await LIC.balanceOf(secondAccount)
            const amountToTransfer = etherToWei('10')

            const result = await LIC.transfer(secondAccount, amountToTransfer, { from: firstAccount })
            
            const event = result.logs[0].args
            assert.equal(event._from, firstAccount, 'Transfered from first account')
            assert.equal(event._to, secondAccount, 'Transfered to second account')
            assert.equal(event._value.toString(), amountToTransfer, 'Transfered correct amount')

            const firstAccountNewBalance = await LIC.balanceOf(firstAccount)
            const secondAccountNewBalance = await LIC.balanceOf(secondAccount)

            assert.equal(
                parseInt(firstAccountNewBalance.toString()), 
                parseInt(firstAccountInitialBalance.toString()) - parseInt(amountToTransfer), 
                'First account has correct balance after transfer'
            )
            assert.equal(
                parseInt(secondAccountNewBalance.toString()), 
                parseInt(secondAccountInitialBalance.toString()) + parseInt(amountToTransfer), 
                'Second account has correct balance after transfer'
            )

            console.log('\n\r', '     => firstAccountNewBalance balance:', parseInt(weiToEther(firstAccountNewBalance)))
            console.log('      => secondAccountNewBalance balance:', parseInt(weiToEther(secondAccountNewBalance)))

        })

        it('Transfer 100 LIC from first account to second account was rejected', async () => {

            const firstAccountInitialBalance = await LIC.balanceOf(firstAccount)
            const secondAccountInitialBalance = await LIC.balanceOf(secondAccount)
            const amountToTransfer = etherToWei('100')

            const ret = await LIC.transfer(secondAccount, amountToTransfer, { from: firstAccount }).should.be.rejected

            const firstAccountNewBalance = await LIC.balanceOf(firstAccount)
            const secondAccountNewBalance = await LIC.balanceOf(secondAccount)

            assert.equal(
                parseInt(firstAccountNewBalance.toString()), 
                parseInt(firstAccountInitialBalance.toString()), 
                'First account balance unchanged after transfer'
            )
            assert.equal(
                parseInt(secondAccountNewBalance.toString()), 
                parseInt(secondAccountInitialBalance.toString()), 
                'Second account balance unchanged after transfer'
            )

            console.log('\n\r', '     => firstAccountNewBalance balance:', parseInt(weiToEther(firstAccountNewBalance)))
            console.log('      => secondAccountNewBalance balance:', parseInt(weiToEther(secondAccountNewBalance)))

        })

        it('Transfer 11 LIC from second account to first account', async () => {
            const firstAccountInitialBalance = await LIC.balanceOf(firstAccount)
            const secondAccountInitialBalance = await LIC.balanceOf(secondAccount)
            const amountToTransfer = etherToWei('11')

            const result = await LIC.transfer(firstAccount, amountToTransfer, { from: secondAccount })
            
            const event = result.logs[0].args
            assert.equal(event._from, secondAccount, 'Transfered from second account')
            assert.equal(event._to, firstAccount, 'Transfered to first account')
            assert.equal(event._value.toString(), amountToTransfer, 'Transfered correct amount')

            const firstAccountNewBalance = await LIC.balanceOf(firstAccount)
            const secondAccountNewBalance = await LIC.balanceOf(secondAccount)

            assert.equal(
                parseInt(firstAccountNewBalance.toString()), 
                parseInt(firstAccountInitialBalance.toString()) + parseInt(amountToTransfer), 
                'First account has correct balance after transfer'
            )
            assert.equal(
                parseInt(secondAccountNewBalance.toString()), 
                parseInt(secondAccountInitialBalance.toString()) - parseInt(amountToTransfer), 
                'Second account has correct balance after transfer'
            )

            console.log('\n\r', '     => firstAccountNewBalance balance:', parseInt(weiToEther(firstAccountNewBalance)))
            console.log('      => secondAccountNewBalance balance:', parseInt(weiToEther(secondAccountNewBalance)))
        })
    })

})