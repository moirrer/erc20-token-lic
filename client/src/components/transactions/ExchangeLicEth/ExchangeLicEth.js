import React, { Component } from "react"
import getWeb3 from "../../../getWeb3"
import LibertyCoinContract from "../../../contracts/LibertyCoin.json"
import ExchangeLicEthContract from "../../../contracts/ExchangeLicEth.json"
import RateForm from './RateForm';
import BuyForm from './BuyForm';
import SellForm from './SellForm';
import AddressAndBalance from '../../card/AddressAndBalance';
import Log from '../../../util/Log'
import "../../../App.scss"

class ExchangeLicEth extends Component {
  state = { 
    loading: true, 
    web3: null, 
    accounts: null,
    account: null,
    warning: null,
    currentForm: 'buyForm',
    balanceEth: 0,
    balanceToken: 0,
    exchangeBalanceEth: 0,
    exchangeBalanceToken: 0,
    rate: null,
    contractLic: null,
    contractExc: null
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

      // Get contracts instances, once loaded will check the accounts balances and finish loading the component
      await this.loadContractsInstance( async() => {
        // Use web3 to get the user's accounts.
        await self.getAccounts()

        // Load balances
        await this.loadMyBalances()

        // Load rate
        await this.loadRate()

        // Set component as loaded
        self.setState({ loading: false })
      })
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error('Failed to load web3, accounts, or contract. Check console for details.')
      console.error(error)
    }
  }

  loadContractsInstance = async (asyncCallback = null) => {
    this.log.info('loadContractsInstance', 'ini')

    // Network to get contract instances
    const networkId = await this.state.web3.eth.net.getId()

    // Get the LibertyCoinContract instance.
    const deployedNetworkLIC = LibertyCoinContract.networks[networkId]
    const contractLic = new this.state.web3.eth.Contract(
      LibertyCoinContract.abi,
      deployedNetworkLIC && deployedNetworkLIC.address,
    )

    // Get the ExchangeLicEthContract instance.
    const deployedNetworkEXC = ExchangeLicEthContract.networks[networkId]
    const contractExc = new this.state.web3.eth.Contract(
      ExchangeLicEthContract.abi,
      deployedNetworkEXC && deployedNetworkEXC.address,
    )

    // Set the contract instances
    await this.setState({ contractLic, contractExc })

    // Load exchange contract balances
    await this.loadExchangeBalances()

    if (typeof(asyncCallback) === 'function') {
      await asyncCallback()
    }

    this.log.info('loadContractsInstance', 'done')
  }

  getAccounts = async (accounts = null) => {
    this.log.info('getAccounts', 'ini')
    this.setWarning('')

    if (accounts === null) {
      accounts = await this.state.web3.eth.getAccounts()
    }

    await this.setState({ accounts })
    this.log.info('getAccounts', 'accounts', accounts)

    if (accounts !== null) {
      await this.setState({ account: accounts[0] })
      this.log.info('getAccounts', 'accounts', this.state.account)
    }

    // Get selected account current LIC tokens balance
    this.loadMyBalances()

    this.log.info('getAccounts', 'done')
  }

  loadExchangeBalances = async () => {
    const exchangeBalanceEth = await this.state.web3.eth.getBalance(this.state.contractExc._address)
    this.setState({ exchangeBalanceEth })
    this.log.info('Etherium balance:', this.weiToEther(this.state.exchangeBalanceEth))

    let exchangeBalanceToken = await this.state.contractLic.methods.balanceOf(this.state.contractExc._address).call()
    this.setState({ exchangeBalanceToken: exchangeBalanceToken.toString() })
    this.log.info('Token balance:', this.weiToEther(this.state.exchangeBalanceToken))
  }

  loadMyBalances = async () => {
    const balanceEth = await this.state.web3.eth.getBalance(this.state.account)
    this.setState({ balanceEth })
    this.log.info('Etherium balance:', this.weiToEther(this.state.balanceEth))

    let balanceToken = await this.state.contractLic.methods.balanceOf(this.state.account).call()
    this.setState({ balanceToken: balanceToken.toString() })
    this.log.info('Token balance:', this.weiToEther(this.state.balanceToken))
  }

  loadRate = async () => {
    let rate = await this.state.contractExc.methods.getRate().call()
    this.setState({ rate: rate.toString() })
    this.log.info('Exchange rate:', this.state.rate)
  }

  setRate = async (rate) => {
    this.log.info('setRate()', 'rate', rate)

    // Update current rate
    this.loadRate()
    
    // Check if is been set to a different value
    this.setWarning('')
    if (rate === this.state.rate) {
      this.setWarning('This is the current rate')
      return
    }

    // Update rate in blockchain
    const options = {
      from: this.state.account
    }
    const hash = await this.state.contractExc.methods.setRate(rate).send(options)
    this.log.info('setRate()', 'hash', hash)
    
    // Update current rate
    this.loadRate()
  }

  buyTokens = async (etherAmount) => {
    this.log.info('buyTokens', etherAmount)

    const options = {
      from: this.state.account,
      value: etherAmount
    }
    
    try {
      const hash = await this.state.contractExc.methods.buyTokens().send(options)
      this.log.info('transactionHash', hash)
    }
    catch (error) {
      this.setWarning(error.message)
    }

    setTimeout(async () => {
      await this.loadMyBalances()
      await this.loadExchangeBalances()
    }, 1000)
  }

  sellTokens = (tokenAmount) => {
    const sendOptions = {
      from: this.state.account
    }
    
    this.state.contractLic.methods.approve(this.state.contractExc._address, tokenAmount).send(sendOptions).on('transactionHash', async (hash) => {
      this.log.info('transactionHash approve', hash)
      this.state.contractExc.methods.sellTokens(tokenAmount).send(sendOptions).on('transactionHash', async (hash2) => {
        this.log.info('transactionHash sellTokens', hash2)
        setTimeout(async () => {
          await this.loadMyBalances()
          await this.loadExchangeBalances()
        }, 1000)
      })
    })
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

    let content
    if (this.state.currentForm === 'buyForm') {
      content = <BuyForm
        web3={this.state.web3} 
        rate={this.state.rate}
        balanceEth={this.state.balanceEth} 
        balanceToken={this.state.balanceToken}
        buyTokens={this.buyTokens} />
    } else {
      content = <SellForm
        web3={this.state.web3} 
        rate={this.state.rate}
        balanceEth={this.state.balanceEth} 
        balanceToken={this.state.balanceToken}
        sellTokens={this.sellTokens} />
    }

    return (
      <section className="section-exchange">

        <AddressAndBalance
          title="Your account"
          account={this.state.accounts[0]}
          balanceLic={this.weiToEther(this.state.balanceToken)}
          balanceEth={this.weiToEther(this.state.balanceEth)}
        ></AddressAndBalance>

        <br />

        <AddressAndBalance
          title="Exchange contract account"
          account={this.state.contractExc._address}
          balanceLic={this.weiToEther(this.state.exchangeBalanceToken)}
          balanceEth={this.weiToEther(this.state.exchangeBalanceEth)}
          addressIcon="contractAddress2.png"
        ></AddressAndBalance>

        <small className="warning">{ this.state.warning }</small>

        <RateForm
          rate={this.state.rate}
          setRate={this.setRate}
        ></RateForm>
        
        <section className="section-exchange buy-sell">
        
          <div className="d-flex justify-content-center mb-3">
            <button
              className={`btn btn-light me-4 ${ this.state.currentForm === 'buyForm' ? "disabled" : "" }`}
              onClick={ (event) => { this.setState({ currentForm: 'buyForm' }) } } >
              Buy
            </button>
            <button
            className={`btn btn-light ${ this.state.currentForm === 'sellForm' ? "disabled" : "" }`}
            onClick={ (event) => { this.setState({ currentForm: 'sellForm' }) } } >
              Sell
            </button>
          </div>

          <div className="mb-4" >
            <div className="card-body" >
              { content }
              <small className="warning">{ this.state.warning }</small>
            </div>
          </div>

        </section>

      </section>
    );
  }
}

export default ExchangeLicEth
