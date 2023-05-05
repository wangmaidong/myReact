import { REACT_TEXT, REACT_FORWARD_REF_TYPE } from '../constant.js';
import { addEvent } from '../event.js';
function render(vdom) {
  mount(vdom, this.container);
}
export function mount(vdom, container) {
  let newDOM = createDOM(vdom);
  container.appendChild(newDOM);
  if(newDOM.componentDidMount) {
    newDOM.componentDidMount()
  }
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
  if(classInstance.UNSAFE_componentWillMount) {
    classInstance.UNSAFE_componentWillMount()
  }
  let renderVdom = classInstance.render();
  classInstance.oldRenderVdom = renderVdom;
  let dom = createDOM(renderVdom)
  if(classInstance.componentDidMount) {
    dom.componentDidMount = classInstance.componentDidMount.bind(classInstance)
  }
  return dom
}
function mountFunctionComponent(vdom) {
  let { type, props } = vdom;
  let renderVdom = type(props);
  vdom.oldRenderVdom = renderVdom
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
export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
  if(!oldVdom && !newVdom) {
    return
  } else if (oldVdom && !newVdom) {
    unMountVdom(oldVdom)
  } else if(!oldVdom && newVdom) {
    let newDOM = createDOM(newVdom)
    if(nextDOM) {
      parentDOM.insertBefore(newDOM, nextDOM)
    } else {
      parentDOM.appendChild(newDOM)
    }
    if(newDOM.componentDidMount) {
      newDOM.componentDidMount()
    }
  } else if(oldVdom && newVdom && (oldVdom.type !== newVdom.type)) {
    unMountVdom(oldVdom)
    let newDOM = createDOM(newVdom)
    if(nextDOM) {
      parentDOM.insertBefore(newDOM, nextDOM)
    } else {
      parentDOM.appendChild(newDOM)
    }
    if(newVdom.componentDidMount) {
      newVdom.componentDidMount()
    }
  } else {
    updateElement(oldVdom, newVdom)
  }
}
function updateElement(oldVdom, newVdom) {
  if(oldVdom.type === REACT_TEXT) {
    let currentDOM = newVdom.dom = findDOM(oldVdom)
    if(oldVdom.props !== newVdom.props) {
      currentDOM.textContent = newVdom.props
    }
    return
  } else if(typeof oldVdom.type === 'string') {
    let currentDOM = newVdom.dom = findDOM(oldVdom)
    updateProps(currentDOM, oldVdom.props, newVdom.props)
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children)
  } else if(typeof oldVdom.type === 'function') {
    if(oldVdom.type.isReactComponent) {
      updateClassComponent(oldVdom, newVdom)
    } else {
      updateFunctionComponent(oldVdom, newVdom)
    }
  }
}
function updateFunctionComponent(oldVdom, newVdom) {
  let currentDOM = findDOM(oldVdom)
  if(!currentDOM) return
  let parentDOM = currentDOM.parentNode
  const {type, props } = newVdom
  const newRenderVdom = type(props)
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, newRenderVdom) 
  newVdom.oldRenderVdom = newRenderVdom
}
function updateClassComponent(oldVdom, newVdom) {
  let classInstance = newVdom.classInstance = oldVdom.classInstance
  if(classInstance.UNSAFE_componentWillReceiveProps) {
    classInstance.UNSAFE_componentWillReceiveProps(newVdom.props)
  }
  classInstance.updater.emitUpdate(newVdom.props)
}
function updateChildren (parentDOM, oldChildren, newChildren) {
  oldChildren = (Array.isArray(oldChildren) ? oldChildren : oldChildren ? [oldChildren] : [])
  newChildren = (Array.isArray(newChildren) ? newChildren : newChildren ? [newChildren] : [])
  let maxLength = Math.max(oldChildren.length, newChildren.length)
  for(let i = 0 ; i < maxLength; i++) {
    let nextVdom = oldChildren.find((item, index) => index > i && item && findDOM(item))
    compareTwoVdom(parentDOM, oldChildren[i], newChildren[i], nextVdom && findDOM(nextVdom))
  }
}
function reconcileChildren(childrenVdom, parentDOM) {
  for (let i = 0; i < childrenVdom.length; i++) {
    mount(childrenVdom[i], parentDOM);
  }
}
function unMountVdom(vdom) {
  const { props, ref } = vdom
  let currentDOM = findDOM(vdom)
  if(vdom.classInstance && vdom.classInstance.componentWillUnmount) {
    vdom.classInstance.componentWillUnmount()
  }
  if(ref) {
    ref.current = null
  }
  if(props.children) {
    const children = Array.isArray(props.children) ? props.children : [props.children]
    children.forEach(unMountVdom)
  }
  if(currentDOM) currentDOM.remove()
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
