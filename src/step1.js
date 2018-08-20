import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

class Step1 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      error: false,
      errorp: false,
      name: '',
      email: '',
      password: '',
      loader: false
    };
  }

  validateEmail(email) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
  }

  submit = () => {
    if (!this.validateEmail(this.state.email)) {
      this.setState({
        error: true
      });
    } else if (this.state.password === '') {
      this.setState({
        errorp: true
      });
    } else {
      this.setState({
        loader: true
      });
      fetch("http://garvit-debian-8.corp.adobe.com:7080/step1", {
        method: 'POST',
        body: JSON.stringify({'email': this.state.email, 'name': this.state.name, 'password': this.state.password})
      })
      .then(res => res.json())
      .then(res => {
        this.setState({
          loader: false
        });
        if (res.error === undefined) {
          this.props.goToStep(res.hash, res.step);
        } else {
          alert('wrong password');
        }
      })
      .catch(() => {
        this.setState({
          loader: false
        });
      });
    }
  }

  changeState = (name) => {
    return event => {
      this.setState({
        [name]: event.target.value
      });
    }
  }

  renderForm() {
    return (
      <div style={{margin: "100px auto", width: "fit-content"}}>
        <Typography style={{flexGrow: 1}} variant="title" color="inherit">
          Spell-Athon
        </Typography>
        <TextField
          id="name"
          label="Name"
          margin="normal"
          value={this.state.value}
          onChange={this.changeState('name')}
        />
        <br/>
        {!this.state.error && <TextField
          id="email"
          label="email"
          margin="normal"
          type="email"
          value={this.state.email}
          onChange={this.changeState('email')}
        />}
        {this.state.error && <TextField
          error
          id="email"
          label="email"
          margin="normal"
          type="email"
          value={this.state.email}
          vale={this.state.email}
          onChange={this.changeState('email')}
        />}
        <br/>
        {!this.state.errorp && <TextField
          id="password"
          label="Password"
          margin="normal"
          type="password"
          value={this.state.value}
          onChange={this.changeState('password')}
        />}
        {this.state.errorp && <TextField
          error
          id="password"
          label="Password"
          type="password"
          margin="normal"
          value={this.state.value}
          onChange={this.changeState('password')}
        />}
        <br/>
        <Button variant="contained" color="primary" style={{float: "right", marginTop: "20px"}} onClick={this.submit}>
          Submit
        </Button>
      </div>
    );
  }

  render() {
    if (!this.state.loader) {
      return this.renderForm();
    } else {
      return (
        <div className="content">
          <CircularProgress size={50} />
        </div>
      );
    }
  }
}

export default Step1;
