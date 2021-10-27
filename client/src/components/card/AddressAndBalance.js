import React, { Component } from "react"
import "../../App.scss"
import logoMetamask from '../../assets/img/metamask.svg';
import logoLic from '../../assets/img/LIC64.png';
import logoEth from '../../assets/img/eth3.png';

class AddressAndBalance extends Component {
  render() {
    let addressIcon = logoMetamask
    if (this.props.addressIcon) {
      addressIcon = this.props.addressIcon
    }
    return (
      <div className="">
        <h4 className="text-light">{ this.props.title }</h4>
        <p className="text-light">
          <img src={addressIcon} height="32" alt="icon" className="mx-1" />
          <i>{ this.props.account }</i>
          <img src={addressIcon} height="32" alt="icon" className="mx-2"/>
          <br/>
          <img src={logoLic} height="24" alt="icon" className="me-2"/>
          <i>{ this.props.balanceLic }</i>
          <span className="ms-3 me-3"></span>
          <img src={logoEth} height="24" alt="icon" className="me-2"/>
          <i>{ this.props.balanceEth }</i>
        </p> 
      </div>
    );
  }
}

export default AddressAndBalance
