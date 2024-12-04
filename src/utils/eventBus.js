import mitt from 'mitt'

const emitter = mitt()

export const useEventBus = () => {
  return {
    emit: emitter.emit,
    on: emitter.on,
    off: emitter.off
  }
}

export default emitter 