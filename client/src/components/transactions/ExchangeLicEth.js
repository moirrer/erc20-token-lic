import React, { Component } from "react"
import getWeb3 from "../../getWeb3"
import Log from '../../util/Log'
import "../../App.scss"

class ExchangeLicEth extends Component {
  state = { 
    loading: true, 
    web3: null, 
    accounts: null,
    warning: null 
  }
  log = new Log('ExchangeLicEth.js', '#5ac18e', true)

  componentDidMount = async () => {
    this.log.info('componentDidMount')

    try {
      const self = this

      // Get network provider and web3 instance
      const web3 = await getWeb3((accounts) => {
        self.getAccounts(accounts)
      })
      await this.setState({ web3 })

      await this.getAccounts()

      // await this.setState({ loading: false })
      
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error('Failed to load web3, accounts, or contract. Check console for details.')
      console.error(error)
    }
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
      return <div>!!! Component in development !!!</div>
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

      </div>
    )
  }
}

export default ExchangeLicEth
