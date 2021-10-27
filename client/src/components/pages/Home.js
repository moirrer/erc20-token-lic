import React, { Component } from 'react'
import AddTransaction from '../transactions/AddToVariable'
import TransferToken from '../transactions/TransferToken'
import ExchangeLicEth from '../transactions/ExchangeLicEth/ExchangeLicEth'
import Log from '../../util/Log'
import './../../App.scss'

class Home extends Component {
  state = { loading: true }
  log = new Log('Home.js', '#25b5d2')

  componentDidMount = async () => {
    this.log.info('componentDidMount')

    try {
      setTimeout(() => { 
        this.setState({ loading: false })
      }, 200)      
    } catch (error) {
      this.log.info('error', error)
    }
  }

  render() {
    if (this.state.loading) {
      return <div>Loading Home...</div>
    }
    return (
      <div>
        <img className="logo" alt="logo" src={ require('../../assets/img/LIC192.png') } />
        <h1>(LIC) LibertyCoin!</h1>
        <p>Your very own ERC20 Token playground</p>
        <p>
          You will need the <a href="https://metamask.io/">MetaMask</a> extension in your browser 
          and have it connected in a local blockchain like <a href="https://www.trufflesuite.com/ganache">Ganache</a>.
        </p>

        <hr/>

        <h3>Smart Contract Example 1: Simple Storage</h3>
        <p>
          A very simple contract with no tokens, just a variable storage.<br/>
          By cliking in the button 'Increase', you will incrase by 1 a variable set in blockchain.<br/>
          This will cost the transaction gas fee only.
        </p>
        <AddTransaction />
        <img className="tutorial" alt="tutorial" src={ require('../../assets/tutorial/simple_storage.png') } />

        <hr/>

        <h3>Smart Contract Example 2: Transfer Token</h3>
        <p>
          The cool stuff, here you will be abble to tranfer LIC tokens <br/>
          from your metamask selected account to another account.
        </p>     
        <TransferToken />
        <img className="tutorial" alt="tutorial" src={ require('../../assets/tutorial/transfer_token.png') } />

        <hr/>

        <h3>Smart Contract Example 3: Exchange Token</h3>
        <p>
          The goal here is to exchange one type of ERC20 token for another.<br/>
          We will be exchanging LIC tokens for ETH tokens, with a given rate of conversion. 
        </p>     
        <ExchangeLicEth />

        <hr/>

        <section className="todo">
          <p>
            Next steps:
          </p>
          <ul>
            <li>(1) exchangeLicEth contract with rate set in contract and possibility to change</li>
            <li>(2) exchangeLicEth tests (set rate, buy and sell)</li>
            <li>(3) exchangeLicEth buy and sell token web interface</li>
          </ul>
        </section>
      </div>
    )
  }
}

export default Home
