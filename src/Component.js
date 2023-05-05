import { findDOM, compareTwoVdom } from './react-dom/client.js'
export let updateQueue = {
  isBatchingUpdate: false,
  updaters: new Set(),
  batchUpdate() {
    updateQueue.isBatchingUpdate = false
    for(const updater of updateQueue.updaters) {
      updater.updateComponent()
    }
    updateQueue.updaters.clear()
  }
}
class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance
    this.pendingStates = []
    this.callbacks = []
  }
  flushCallbacks() {
    if(this.callbacks.length > 0) {
      this.callbacks.forEach((callback) => callback())
    }
    this.callbacks.length = 0
  }
  addState(partialState, callback) {
    this.pendingStates.push(partialState)
    if(typeof callback === 'function') {
      this.callbacks.push(callback)
    }
    this.emitUpdate()
  }
  emitUpdate(nextProps) {
    
    this.nextProps = nextProps
    if(updateQueue.isBatchingUpdate) {
      updateQueue.updaters.add(this)
    } else {
      this.updateComponent()
    }
  }
  updateComponent() {
    let { classInstance, pendingStates, nextProps } = this
    if(nextProps || pendingStates.length > 0) {
      shouldUpdate(classInstance, nextProps, this.getState())
    }
  }
  getState() {
    // eslint-disable-next-line
    let {classInstance, pendingStates } = this
    let { state } = classInstance
    pendingStates.forEach((nextState) => {
      if(typeof nextState === 'function') {
        nextState = nextState(state)
      }
      state = { ...state, ...nextState}
    })
    pendingStates.length = 0
    return state
  }
  
}
function shouldUpdate (classInstance,nextProps,  nextState) {
  let willUpdate = true
  if(classInstance.shouldComponentUpdate && (!classInstance.shouldComponentUpdate(nextProps, nextState))) {
    willUpdate = false
  }
  if(willUpdate && classInstance.UNSAFE_componentWillUpdate) {
    classInstance.UNSAFE_componentWillUpdate()
  }
  classInstance.state = nextState
  if(nextProps) {
    classInstance.props = nextProps
  }
  if(willUpdate) {
    classInstance.forceUpdate()
  }
}
export class Component {
  static isReactComponent = true
  constructor(props) {
    this.props = props
    this.state = {}
    this.updater = new Updater(this)
  }
  setState(partialState, callback) {
    this.updater.addState(partialState, callback)
  }
  forceUpdate() {
    
    let oldRenderVdom = this.oldRenderVdom
    let oldDom = findDOM(oldRenderVdom)
    let newRenderVdom = this.render()
    compareTwoVdom(oldDom.parentNode, oldRenderVdom, newRenderVdom)
    this.oldRenderVdom = newRenderVdom
    this.updater.flushCallbacks()
    if(this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state)
    }
  }
}