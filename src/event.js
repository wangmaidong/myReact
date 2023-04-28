import { updateQueue } from './Component'
/** 
 * 
 * @param {*} dom 
 * @param {*} eventType 
 * @param {*} handler 
 */
export function addEvent(dom, eventType, handler) {
  let store = dom.store || (dom.store = {})
  store[eventType.toLowerCase()] = handler
  const eventName = eventType.toLowerCase()
  const name = eventName.replace(/Capture$/, '').slice(2)
  if(!document[name]) {
    document.addEventListener(eventName.slice(2), (event) => {
      dispatchEvent(event, true)
    }, true)
    document.addEventListener(eventName.slice(2), (event) => {
      dispatchEvent(event, false)
    }, false)
    document[name] = true
  }
}
function dispatchEvent(event, isCapture) {
  const {target, type} = event
  let eventType = `on${type}`
  let eventTypeCapture = `on${type}capture`
  let syntheticEvent = createSyntheticEvent(event)
  updateQueue.isBatchingUpdate = true
  let targetStack = []
  let currentTarget = target
  while(currentTarget) {
    targetStack.push(currentTarget)
    currentTarget = currentTarget.parentNode
  }
  if(isCapture) {
    for(let i = targetStack.length - 1; i >= 0; i--) {
      const currentTarget = targetStack[i]
      let { store } = currentTarget
      let handler = store && store[eventTypeCapture]
      handler&&handler(syntheticEvent)
    }
  } else {
    for(let i = 0; i < targetStack.length ; i++) {
      const currentTarget = targetStack[i]
      let { store } = currentTarget
      let handler = store && store[eventType];
      handler&&handler(syntheticEvent);
      if(syntheticEvent.isPropagationStopped) {
        break;
      }
    }
  }
  updateQueue.batchUpdate()
}

function createSyntheticEvent(nativeEvent) {
  let syntheticEvent = {}
  for(let key in nativeEvent) {
    let value = nativeEvent[key]
    if(typeof value === 'function') value = value.bind(nativeEvent)
    syntheticEvent[key] = value
  }
  syntheticEvent.nativeEvent = nativeEvent
  syntheticEvent.isDefaultPrevented = false
  syntheticEvent.preventDefault = preventDefault
  syntheticEvent.isPropagationStopped = false
  syntheticEvent.stopPropagation = stopPropagation
  return syntheticEvent
}
function preventDefault() {
  this.isDefaultPrevented = true
  const nativeEvent = this.nativeEvent
  if(nativeEvent.preventDefault) {
    nativeEvent.preventDefault()
  } else {
    nativeEvent.returnValue = false
  }
}
function stopPropagation() {
  this.isPropagationStopped = true
  const nativeEvent = this.nativeEvent
  if(nativeEvent.isPropagationStopped) {
    nativeEvent.stopPropagation()
  } else {
    nativeEvent.cancelBubble = true
  }
}