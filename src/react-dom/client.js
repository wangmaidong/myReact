import { REACT_TEXT, REACT_FORWARD_REF_TYPE } from '../constant.js';
import { addEvent } from '../event.js';
function render(vdom) {
  mount(vdom, this.container);
}
export function mount(vdom, container) {
  let newDOM = createDOM(vdom);
  container.appendChild(newDOM);
}
export function createDOM(vdom) {
  let { type, props, ref } = vdom;
  let dom;
  if (type && type.$$typeof === REACT_FORWARD_REF_TYPE) {
    return mountForwardComponent(vdom)
  } else if (type === REACT_TEXT) {
    dom = document.createTextNode(props);
  } else if (typeof type === 'function') {
    if (type.isReactComponent) {
      return mountClassComponent(vdom);
    } else {
      return mountFunctionComponent(vdom);
    }
  } else {
    dom = document.createElement(type);
  }
  if (props) {
    updateProps(dom, {}, props);
    if (typeof props.children == 'object' && props.children.type) {
      mount(props.children, dom);
    } else if (Array.isArray(props.children)) {
      reconcileChildren(props.children, dom);
    }
  }
  vdom.dom = dom;
  if(ref) ref.current = dom
  return dom;
}
function mountForwardComponent(vdom) {
  let { type, props, ref } = vdom
  let renderVdom = type.render(props, ref)
  vdom.oldRenderVdom = renderVdom
  return createDOM(renderVdom)
}
function mountClassComponent(vdom) {
  let { type, props, ref } = vdom;
  let classInstance = new type(props);
  if(ref) ref.current = classInstance
  vdom.classInstance = classInstance;
  let renderVdom = classInstance.render();
  classInstance.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}
function mountFunctionComponent(vdom) {
  let { type, props } = vdom;
  let renderVdom = type(props);
  return createDOM(renderVdom);
}
function updateProps(dom, oldProps = {}, newProps = {}) {
  for (let key in newProps) {
    if (key === 'children') {
      continue;
    } else if (key === 'style') {
      let styleObj = newProps[key];
      for (let attr in styleObj) {
        dom.style[attr] = styleObj[attr];
      }
    } else if (/^on[A-Z].*/.test(key)) {
      addEvent(dom, key, newProps[key]);
    } else {
      dom[key] = newProps[key];
    }
  }
  for (let key in oldProps) {
    if (!newProps.hasOwnProperty(key)) {
      dom[key] = null;
    }
  }
}
export function findDOM(vdom) {
  if (!vdom) return null;
  if (vdom.dom) {
    return vdom.dom;
  } else {
    const renderVdom = vdom.classInstance ? vdom.classInstance.oldRenderVdom : vdom.oldRenderVdom;
    return findDOM(renderVdom);
  }
}
export function compareTwoVdom(parentDOM, oldVdom, newVdom) {
  let oldDOM = findDOM(oldVdom);
  let newDOM = createDOM(newVdom);
  parentDOM.replaceChild(newDOM, oldDOM);
}
function reconcileChildren(childrenVdom, parentDOM) {
  for (let i = 0; i < childrenVdom.length; i++) {
    mount(childrenVdom[i], parentDOM);
  }
}
class Root {
  constructor(container) {
    this.container = container;
    this.render = render;
  }
}
function createRoot(container) {
  return new Root(container);
}
const ReactDOM = {
  createRoot,
};
export default ReactDOM;
