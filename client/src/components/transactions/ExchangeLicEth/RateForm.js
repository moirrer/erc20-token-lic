import React, { Component } from 'react';

class RateForm extends Component {

  constructor (props) {
    super(props)
    this.state = {
      rate: this.props.rate
    }
  }

  render() {
    return (
      <form className="mb-3" onSubmit={(event) => {
        event.preventDefault()
        this.props.setRate(this.state.rate)
      }}>

        <div className="input-group justify-content-center">
          <div className="input-group-append input-group-lg">
            <div className="input-group-text">
              Rate is 1 ETH to 
            </div>
          </div>
          <input 
            onChange={(event) => {
              const rate = this.input.value.toString()
              this.setState({ rate })
            }}
            ref={(input) => { this.input = input }}
            value={this.state.rate}
            type="text" 
            className="from-control form-control-lg" 
            placeholder="0" 
            required />
          <div className="input-group-append input-group-lg">
            <div className="input-group-text">
              LIC
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg mt-1 mb-4">Override exchange rate</button>

      </form>
    );
  }
}

export default RateForm;
