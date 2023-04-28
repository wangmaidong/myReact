import React from './react';
import ReactDOM from './react-dom/client';
const TextInput = React.forwardRef((props, ref) => {
  return <input ref={ref}/>
})
class Form extends React.Component {
  constructor(props) {
    super(props)
    this.input = React.createRef()
  }
  getFocus = () => {
    this.input.current.focus()
  }
  render() {
    return (
      <>
      <TextInput ref={this.input}/>
      <button onClick={this.getFocus}>获得焦点</button>
      </>
    )
  }
}
let element = <Form />;
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(element);
