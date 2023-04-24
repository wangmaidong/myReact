import { REACT_TEXT } from "../constant.js";
function render(vdom) {
    mount(vdom, this.container);
}
export function mount(vdom, container) {
    let newDOM = createDOM(vdom);
    container.appendChild(newDOM);
}
export function createDOM(vdom) {
    let { type, props } = vdom;
    let dom;
    if (type === REACT_TEXT) {
        dom = document.createTextNode(props);
    } else if(typeof type === 'function') {
      if(type.isReactComponent) {
        return mountClassComponent(vdom)
      } else {
        return mountFunctionComponent(vdom);
      }
    } else {
        dom = document.createElement(type);
    }
    if (props) {
        updateProps(dom, {}, props);
        if (typeof props.children == "object" && props.children.type) {
            mount(props.children, dom);
        } else if (Array.isArray(props.children)) {
            reconcileChildren(props.children, dom);
        }
    }
    vdom.dom = dom;
    return dom;
}
function mountClassComponent(vdom) {
  let { type, props } = vdom
  let classInstance = new type(props)
  let renderVdom = classInstance.render()
  return createDOM(renderVdom)
}
function mountFunctionComponent(vdom) {
  let {type, props} = vdom
  let renderVdom = type(props)
  return createDOM(renderVdom)
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
function reconcileChildren(childrenVdom, parentDOM) {
    for (let i = 0; i < childrenVdom.length; i++) {
        mount(childrenVdom[i], parentDOM);
    }
}
class Root {
    constructor(container) {
        this.container = container;
        this.render = render
    }
}
function createRoot(container) {
    return new Root(container);
}
const ReactDOM = {
    createRoot
}
export default ReactDOM