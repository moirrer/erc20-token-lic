import React, { Component } from 'react';
import logoToken from '../../../assets/img/LIC64.png';
import logoEth from '../../../assets/img/eth3.png';

class SellForm extends Component {

  constructor (props) {
    super(props)
    this.state = {
      output: 0
    }
  }

  etherToWei = (n) => {
    if (typeof(n) !== 'string') {
      n = n.toString()
    }
    return this.props.web3.utils.toWei(n, 'ether')
  }

  weiToEther = (n) => {
    if (typeof(n) !== 'string') {
      n = n.toString()
    }
    return this.props.web3.utils.fromWei(n, 'ether')
  }

  render() {
    return (
      <form className="mb-3" onSubmit={(event) => {
        event.preventDefault()
        let tokenAmount = this.input.value.toString()
        tokenAmount = this.etherToWei(tokenAmount)
        this.props.sellTokens(tokenAmount)
      }}>

        <div className="justify-content-center mb-5 text-light" >
          <h4 className="">Sell LIC tokens for ETH</h4>
        </div>

        <div className="input-group mb-4 justify-content-center">
          <input 
            onChange={(event) => {
              const tokenAmount = this.input.value.toString()
              this.setState({ output: tokenAmount / this.props.rate })
            }}
            ref={(input) => {
              this.input = input
            }}
            type="text" 
            className="from-control form-control-lg" 
            placeholder="0" 
            required />
          <div className="input-group-append input-group-lg">
            <div className="input-group-text">
              <img src={logoToken} height="32" alt="" /> &nbsp; LIC
            </div>
          </div>
        </div>

        <div className="input-group mb-2 justify-content-center">
          <input
            value={ this.state.output }
            type="text"
            className="from-control form-control-lg"
            placeholder="0"
            disabled
            required />
          <div className="input-group-append input-group-lg">
            <div className="input-group-text">
              <img src={logoEth} height="32" alt="" /> &nbsp;&nbsp;&nbsp; ETH
            </div>
          </div>
        </div>

        <div className="mb-5 text-light" >
          <span className="float-left">Exchange Rate | </span>
          <span className="float-right">1 ETH = { this.props.rate } LIC</span>
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg">Sell LIC</button>

      </form>
    );
  }
}

export default SellForm;
