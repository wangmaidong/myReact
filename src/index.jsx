import React from './react.js';
import ReactDOM from './react-dom/client';
const root = ReactDOM.createRoot(document.getElementById('root'));
class ClassComponent extends React.Component {
  render() {
    return (
      <div className="title" style={{ color: 'red' }}>
        <span>{this.props.name}</span>
        {this.props.children}
      </div>
    );
  }
}
let element = <ClassComponent name="hello">world11</ClassComponent>;
root.render(element);
