import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Row from './row';

class Step6 extends Component {

  constructor(props) {
    super(props);
    this.rows = [];
    this.interval = setInterval(() => {
      if (typeof(Storage) !== "undefined") {
        let filled_inputs = [];
        this.rows.forEach((row) => {
          filled_inputs.push(row.getValue());
        });
        localStorage.setItem('step6_ans_filled', JSON.stringify(filled_inputs));
      }
    }, 1000);
  }

  shouldComponentUpdate(nextprops, nextstate) {
    return false;
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  submit = () => {
    let filled_inputs = [];
    this.rows.forEach((row) => {
      filled_inputs.push(row.getValue());
    });
    fetch("http://garvit-debian-8.corp.adobe.com:7080/step6", {
      method: 'POST',
      body: JSON.stringify({filled_inputs: filled_inputs, hash: this.props.hash})
    })
    .then(res => res.json())
    .then((res) => {
      this.props.goToStep(this.props.hash, res.step);
    })
  }

  goToNextInput = (i) => {
    return () => {
      i+1 < this.rows.length && this.rows[i+1].setFocus();
    };
  }

  goToPrevInput = (i) => {
    return () => {
      i-1 >= 0 && this.rows[i-1].setFocus();
    }
  }

  generateRows = (number, offset) => {
    const rows = [];
    offset = offset === undefined ? 0 : offset;
    let filled_inputs = undefined;
    if (typeof(Storage) !== "undefined") {
      filled_inputs = localStorage.getItem('step6_ans_filled');
      filled_inputs = filled_inputs === null ? undefined : JSON.parse(filled_inputs);
    }
    for (let i = 0; i < number; ++i) {
      rows.push((
        <Row
          key={i}
          number={i+1}
          value={filled_inputs !== undefined ? filled_inputs[i] : undefined}
          ref={input => this.rows.push(input)}
          goToNextInput={this.goToNextInput(i + offset)}
          goToPrevInput={this.goToPrevInput(i + offset)}
        />
      ));
    }
    return rows;
  }

  render() {
    return (
      <div className="content">
        <div>Prelims</div>
        <div>Part 1</div>
        <br />
        {this.generateRows(5)}
        <br />
        <br />
        <div>Prelims</div>
        <div>Part 2</div>
        <br />
        {this.generateRows(5, 5)}
        <br />
        <br />
        <div>Prelims</div>
        <div>Part 3</div>
        <br />
        {this.generateRows(5, 10)}
        <Button variant="contained" color="primary" style={{marginTop: "20px"}} onClick={this.submit}>
          Submit
        </Button>
      </div>
    );
  }
}

export default Step6;
