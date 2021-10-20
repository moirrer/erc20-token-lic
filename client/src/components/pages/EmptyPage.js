import React, { Component } from 'react';
import Log from '../../util/Log'
import './../../App.css';

class App extends Component {
  state = { loading: true }

  componentDidMount = async () => {
    const log = new Log('EmptyPage.js', '#25b5d2')
    log.info('ini')

    try {
      setTimeout(() => { 
        this.setState({ loading: false })
      }, 1000)      
    } catch (error) {
      
    }
  }

  render() {
    if (this.state.loading) {
      return <div>Loading page...</div>;
    }
    return (
      <div>
        <h1>Empty page</h1>
      </div>
    );
  }
}

export default App;
