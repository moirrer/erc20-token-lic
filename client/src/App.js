import React, { Component } from 'react';
import PageHome from './components/pages/Home'

class App extends Component {
  state = { loading: true }

  componentDidMount = async () => {
    this.setState({loading: false})
  }

  render() {
    if (this.state.loading) {
      return <div>Loading app...</div>;
    }
    return (
      <div className="App">
        <PageHome />
      </div>
    );
  }
}

export default App;
