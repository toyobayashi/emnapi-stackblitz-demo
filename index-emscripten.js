let init, getDefaultContext

const isNodeLike = typeof process !== 'undefined' && process.versions && typeof process.versions.node === 'string'

if (isNodeLike) {
  getDefaultContext = require('@emnapi/runtime').getDefaultContext
  init = require('./out/wasm32-unknown-emscripten/demo_emscripten.js')
} else {
  getDefaultContext = globalThis.emnapi.getDefaultContext
  init = globalThis.demo
}

init().then(Module => {
  const binding = Module.emnapiInit({ context: getDefaultContext() })
  binding.echo(
    'input',
    function okCallback (err, result) {
      console.log(err, result)
    },
    function progressCallback (i) {
      console.log('progressCallback: ' + i)
    }
  )
  console.log('echo')
})
