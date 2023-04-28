import React from './react';
import ReactDOM from './react-dom/client';
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      number: 0,
    };
  }
  handleClick = () => {
    this.setState({ number: this.state.number + 1 });
    console.log(this.state);
    this.setState({ number: this.state.number + 1 });
    console.log(this.state);
    setTimeout(() => {
      this.setState({ number: this.state.number + 1 });
      console.log(this.state);
      this.setState({ number: this.state.number + 1 });
      console.log(this.state);
    });
  };
  handleClick2 = () => {
    this.setState({ number: this.state.number + 1 });
  };
  clickParentCapture = (event) => {
    console.log('clickParentCapture');
  };
  clickParentBubble = (event) => {
    console.log('clickParentBubble');
  };
  clickChildCapture = (event) => {
    console.log('clickChildCapture');
  };
  clickChildBubble = (event) => {
    console.log('clickChildBubble');
  };
  render() {
    return (
      <div onClick={this.clickParentBubble} onClickCapture={this.clickParentCapture}>
        <div onClick={this.clickChildBubble} onClickCapture={this.clickChildCapture}>
          <p>{this.props.title}</p>
          <p> number: {this.state.number}</p>
          <button onClick={this.handleClick}> +</button>
        </div>
      </div>
    );
  }
}
let element = <Counter title="计数器" />;
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(element);
