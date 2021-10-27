import React, { Component } from "react"
import SimpleStorageContract from "../../contracts/SimpleStorage.json"
import getWeb3 from "../../getWeb3"
import Log from '../../util/Log'
import "../../App.scss"

class AddToVariable extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null, warning: null }
  log = new Log('AddToVariable.js', '#96c73c', false)

  componentDidMount = async () => {
    this.log.info('componentDidMount')

    try {
      const self = this
      
      // Get network provider and web3 instance.
      const web3 = await getWeb3((accounts) => {
        self.getAccounts(accounts)
      })
      await this.setState({ web3 })

      // Use web3 to get the user's accounts.
      this.getAccounts()

      // Get the contract instance.
      const networkId = await web3.eth.net.getId()
      const deployedNetwork = SimpleStorageContract.networks[networkId]
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      )

      // Set contract to the state
      this.setState({ contract: instance }, async () => { 
        this.getContractVariable()
      })
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error('Failed to load web3, accounts, or contract. Check console for details.')
      console.error(error)
    }
  }

  getAccounts = async (accounts = null) => {
    if (accounts === null) {
      accounts = await this.state.web3.eth.getAccounts()
    }
    this.setState({ accounts })
    this.log.info('getAccounts', accounts)
  }

  setWarning(message) {
    this.setState({ warning: message })
  }

  increaseContractVariable = async () => {
    this.log.info('increaseContractVariable()')
    const { storageValue } = this.state
    const newValue = parseInt(storageValue) + 1
    this.log.info('newValue', newValue)

    await this.setContractVariable(newValue)
  }

  decreaseContractVariable = async () => {
    this.log.info('decreaseContractVariable()')
    const { storageValue } = this.state
    const newValue = parseInt(storageValue) - 1
    this.log.info('newValue', newValue)

    if (newValue >= 0) {
      await this.setContractVariable(newValue)
    } else {
      this.setWarning('0 is the minimum')
    }
  }

  setContractVariable = async (newValue) => {
    this.log.info('setContractVariable()')
    this.setWarning('')
    
    const { accounts, contract } = this.state

    // Stores a given value
    await contract
          .methods
          .set(newValue)
          .send({ from: accounts[0] })
          .on('transactionHash', (tx) => {
            this.log.info('transactionHash', tx)
          })
          .on('error', (error, receipt) => {
            this.log.info('Participate Error - Receipt', error, receipt)
            this.setWarning(error.message)
          })
          .catch((error) => {
            this.log.info('setContractVariable', 'catch', error)
          })
    
    await this.getContractVariable()
  }

  getContractVariable = async () => {
    this.log.info('getContractVariable()')
    const { contract } = this.state

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call()

    // Update state with the result.
    this.setState({ storageValue: response })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>
    }
    return (
      <div>
        <div>Blockchain stored value is: {this.state.storageValue}</div>
        <div>
          <button
            onClick={ (event) => { 
              this.increaseContractVariable() 
            }}
          >Increase</button>
          <button
            onClick={ (event) => { 
              this.decreaseContractVariable() 
            }}
          >Decrease</button>
        </div>
        <small className="warning">{ this.state.warning }</small>
      </div>
    )
  }
}

export default AddToVariable
