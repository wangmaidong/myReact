import { findDOM, compareTwoVdom } from './react-dom/client.js'
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
  emitUpdate() {
    this.updateComponent()
  }
  updateComponent() {
    let { classInstance, pendingStates } = this
    if(pendingStates.length > 0) {
      shouldUpdate(classInstance, this.getState())
    }
  }
  getState() {
    // eslint-disable-next-line
    let {classInstance, pendingStates } = this
    let { state } = this
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
function shouldUpdate (classInstance, nextState) {
  classInstance.state = nextState
  classInstance.forceUpdate()
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

  }
}