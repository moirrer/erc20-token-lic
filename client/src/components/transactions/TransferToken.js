import React, { Component } from "react"
import LibertyCoinContract from "../../contracts/LibertyCoin.json"
import getWeb3 from "../../getWeb3"
import Log from '../../util/Log'
import "../../App.scss"

class TransferToken extends Component {
  state = { 
    loading: true, 
    web3: null, 
    contract: null, 
    accounts: null, 
    balance: null, 
    transferAccount: '0x576Ee89a10Ed2DC864F34B0ec623d66358dC30d4',
    transferAmount: 1,
    warning: null 
  }
  log = new Log('TransferToken.js', '#4287f5', true)

  componentDidMount = async () => {
    this.log.info('componentDidMount')

    try {
      const self = this

      // Get network provider and web3 instance
      const web3 = await getWeb3((accounts) => {
        self.getAccounts(accounts)
      })
      await this.setState({ web3 })
    
      // Get the contract instance, once loaded will check the accounts and finish loading the component
      await this.loadContractInstance( async() => {
        // Use web3 to get the user's accounts.
        await self.getAccounts()

        // Set component as loaded
        self.setState({ loading: false })
      })
      
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error('Failed to load web3, accounts, or contract. Check console for details.')
      console.error(error)
    }
  }

  loadContractInstance = async (asyncCallback = null) => {
    this.log.info('loadContractInstance', 'ini')

    // Get the contract instance.
    const networkId = await this.state.web3.eth.net.getId()
    const deployedNetwork = LibertyCoinContract.networks[networkId]
    const instance = new this.state.web3.eth.Contract(
      LibertyCoinContract.abi,
      deployedNetwork && deployedNetwork.address,
    )
    await this.setState({ contract: instance })

    if (typeof(asyncCallback) === 'function') {
      await asyncCallback()
    }

    this.log.info('loadContractInstance', 'done')
  }

  getAccounts = async (accounts = null) => {
    this.log.info('getAccounts', 'ini')
    this.setWarning('')

    if (accounts === null) {
      accounts = await this.state.web3.eth.getAccounts()
    }
    await this.setState({ accounts })
    this.log.info('getAccounts', accounts)

    // Get selected account current LIC tokens balance
    await this.getMyAccountBalance(accounts[0])

    this.log.info('getAccounts', 'done')
  }

  getAccountBalance = async (account) => {
    this.log.info('getAccountBalance', 'ini', account)
    this.setWarning('')

    if(this.state.contract === null) {
      // If contract not loaded yet, await and retry
      setTimeout(async() => {
        return await this.getMyAccountBalance(account)
      }, 500)
    } else {
      // Get account LIC tokens balance
      let accounntBalance
      try {
        accounntBalance = await this.state.contract.methods.balanceOf(account).call()
      } catch (e) {
        this.log.info('getAccountBalance', 'catch', e.message)
        this.setWarning(e.message)
        return null
      }
      accounntBalance = this.weiToEther(accounntBalance)

      this.log.info('getAccountBalance', 'done', accounntBalance)
      return accounntBalance
    }
  }

  getMyAccountBalance = async (account) => {
    this.log.info('getMyAccountBalance', 'ini', account)

    // Check if has a selected account (if account was deleted in Metamask will received account undefined)
    if (account === undefined) {
      this.log.info('getMyAccountBalance', 'X', 'no account selected in Metamask')
      this.setWarning('No account selected in Metamask')
      return
    }

    // Get account LIC tokens balance
    let accounntBalance = await this.getAccountBalance(account)
    this.setState({ balance: accounntBalance })
    this.log.info('getMyAccountBalance', 'done', accounntBalance)
  }

  makeTransfer = async () => {
    this.log.info('makeTransfer', 'ini')
    this.setWarning('')

    // Update current balance with network
    await this.getMyAccountBalance(this.state.accounts[0])

    // Check if transfer amount is < than current balance
    if (parseInt(this.state.balance) < parseInt(this.state.transferAmount)) {
      this.setWarning(this.state.accounts[0] + ' has no balance to make this transfer')
      return
    }

    // Check if has a valid addres to transfer (will need to return a balance not null)
    const accountToTransferBalance = await this.getAccountBalance(this.state.transferAccount)
    this.log.info('makeTransfer', 'accountToTransferBalance', accountToTransferBalance)
    if (accountToTransferBalance === null) {
      this.setWarning(this.state.transferAccount + ' is a invalid address to transfer to')
      return
    }
    
    // Transfer from Metamask account to typed address
    const sendOptions = {
      from: this.state.accounts[0]
    }
    try {
      const amountInWei = this.etherToWei(this.state.transferAmount)
      const transaction = await this.state.contract.methods.transfer(
          this.state.transferAccount,
          amountInWei
        )
        .send(sendOptions)

      this.log.info('makeTransfer', 'transaction', transaction)
      
      // Update current balance with network
      setTimeout(async() => {
        await this.getMyAccountBalance(this.state.accounts[0])
      }, 500)
    } catch (e) {
      this.log.info('makeTransfer', 'catch', e.message)
      this.setWarning(e.message)
    }

    this.log.info('makeTransfer', 'done')
  }

  etherToWei = (n) => {
    if (typeof(n) !== 'string') {
      n = n.toString()
    }
    return this.state.web3.utils.toWei(n, 'ether')
  }

  weiToEther = (n) => {
    if (typeof(n) !== 'string') {
      n = n.toString()
    }
    return this.state.web3.utils.fromWei(n, 'ether')
  }

  setWarning(message) {
    this.setState({ warning: message })
  }

  render() {
    if (this.state.loading) {
      return <div>Loading Web3, accounts, and contract...</div>
    }
    return (
      <div>
        <div>
          <p>
            Metamask account: <i>{ this.state.accounts[0] }</i>
            <br/>
            LIC balance: <i>{ this.state.balance }</i>
          </p> 
        </div>
        <small className="warning">{ this.state.warning }</small>
        <br/>

        Make a transfer to &nbsp;
        <input 
            value={ this.state.transferAccount }
            onChange={(event) => {
              this.setState({transferAccount: event.target.value })
            }}
            type="text"
            className="transfer-address"
            placeholder=""
            required />

        <br/>
        Transfer the amount of &nbsp;
        <input 
            value={ this.state.transferAmount }
            onChange={(event) => {
              this.setState({transferAmount: event.target.value })
            }}
            type="text"
            className="transfer-amount"
            placeholder="1"
            required />
        &nbsp;<small><i>Max of { this.state.balance } LIC </i></small>
        <br/>
        <button
            onClick={ (event) => { 
              this.makeTransfer() 
            }}
          >Transfer</button>
      </div>
    )
  }
}

export default TransferToken
