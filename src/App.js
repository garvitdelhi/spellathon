import React, { Component } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Image from 'material-ui-image';
import Step2 from './step2';
import Step1 from './step1';
import Step4 from './step4';
import Step6 from './step6';

class App extends Component {

  constructor(props) {
    super(props);
    this.focus = true;
    this.state= {
      step: 1,
      hash: undefined
    };
  }

  componentDidMount() {
    const that = this;
    setInterval(() => {
      if (!document.hasFocus() && that.focus && (this.state.step === 2 || this.state.step === 4)) {
        that.focus = false;
        fetch("http://garvit-debian-8.corp.adobe.com:7080/out", {
          method: 'POST',
          body: JSON.stringify({hash: this.state.hash})
        });
      } else if (document.hasFocus()) {
        that.focus = true;
      }
    }, 100);
  }

  goToStep = (hash, step) => {
    this.setState({
      step: step,
      hash: hash
    });
  }

  render() {
    return (
      <div className="app">
        <AppBar className="header" position="static" color="primary">
          <Toolbar>
            <img src="http://garvit-debian-8.corp.adobe.com:3000/Escape_logo_Generic.png" style={{width: "100px"}}/>
          </Toolbar>
        </AppBar>
        {this.state.step === 1 &&
          <Step1 goToStep={this.goToStep} hash={this.state.hash} />
        }
        {this.state.step === 2 &&
          <Step2 goToStep={this.goToStep} hash={this.state.hash}/>
        }
        {this.state.step === 3 &&
          <div className="content">Thanks! let us check :)</div>
        }
        {this.state.step === 4 &&
          <Step4 goToStep={this.goToStep} hash={this.state.hash}/>
        }
        {this.state.step === 5 &&
          <div className="content">Thanks! let us check :)</div>
        }
        {this.state.step === 6 &&
          <Step6 goToStep={this.goToStep} hash={this.state.hash}/>
        }
        {this.state.step === 7 &&
          <div className="content">Thanks! let us check :)</div>
        }
      </div>
      )
    }
}

export default App;
