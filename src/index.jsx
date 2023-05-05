import React from './react';
import ReactDOM from './react-dom/client';
class Counter extends React.Component {
  static defaultProps = {
    name: '珠峰架构'
  }
  constructor(props) {
    super(props)
    this.state = {
      number: 0
    }
    console.log('Counter 1.constructor')
  }
  UNSAFE_componentWillMount() {
    console.log('Counter 2.componentWillMount')
  }
  componentDidMount() {
    console.log('Counter 4.componentDidMount')
  }
  handleClick = () => {
    this.setState({
      number: this.state.number + 1
    })
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log('nextState--->', nextState)
    console.log('Counter 5.shouldComponentUpdate 2的倍数', nextState.number % 2 === 0)
    return nextState.number % 2 === 0
  }
  UNSAFE_componentWillUpdate() {
    console.log('Counter 6.componentWillUpdate')
  }
  componentDidUpdate() {
    console.log('Counter 7.componentDidUpdate')
  }
  render() {
    console.log('Counter 3.render')
    return (
      <div>
        <div>{this.state.number === 4 ? null : <ChildCounter count={this.state.number} />}</div>
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
}
class ChildCounter extends React.Component{
  componentWillUnmount() {
    console.log('ChildCounter 6.componentWillUnmount')
  }
  componentWillMount() {
    console.log('ChildCounter 1.componentWillMount')
  }
  render() {
    console.log('ChildCounter 2.render')
    return (
      <div>
        {this.props.count}ChildCounter
      </div>
    )
  }
  componentDidMount() {
    console.log("ChildCounter 3.componentDidMount")
  }
  componentWillReceiveProps(newProps) {
    console.log('ChildCounter 4.componentWillReceiveProps')
  }
  shouldComponentUpdate(nextProps, nextState) {
    
    console.log('nextProps--->', nextProps)
    console.log('ChildCounter 5.shouldComponentUpdate 3的倍数', nextProps.count % 3 === 0)
    return nextProps.count % 3 === 0
  }
}
let element = <Counter/>
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(element);
