
let instantiateNapiModule
let getDefaultContext
let WASI
let fs
let input

const isNodeLike = typeof process !== 'undefined' && process.versions && typeof process.versions.node === 'string'

if (isNodeLike) {
  getDefaultContext = require('@emnapi/runtime').getDefaultContext
  instantiateNapiModule = require('@emnapi/core').instantiateNapiModule
  // native Node.js
  // WASI = require('wasi').WASI
  WASI = require('@tybys/wasm-util').WASI
  fs = require('fs')
  input = fs.promises.readFile('./out/wasm32-wasi-threads/demo_wasi_threads.wasm')
} else {
  getDefaultContext = globalThis.emnapi.getDefaultContext
  instantiateNapiModule = globalThis.emnapiCore.instantiateNapiModule
  WASI = globalThis.wasmUtil.WASI
  const { Volume, createFsFromVolume } = globalThis.memfs
  fs = createFsFromVolume(Volume.fromJSON({
    '/': null
  }))
  input = fetch('./out/wasm32-wasi-threads/demo_wasi_threads.wasm')
}

instantiateNapiModule(input, {
  context: getDefaultContext(),
  wasi: new WASI({ fs }),
  // reuseWorker: true,
  onCreateWorker () {
    if (isNodeLike) {
      const { Worker } = require('worker_threads')
      return new Worker(require('path').join(__dirname, './pthread-worker.js'), {
        env: process.env,
        // execArgv: ['--experimental-wasi-unstable-preview1']
      })
    }
    return new Worker('./pthread-worker.js')
  },
  overwriteImports (importObject) {
    importObject.env.memory = new WebAssembly.Memory({
      initial: 16777216 / 65536,
      maximum: 2147483648 / 65536,
      shared: true
    })
  }
}).then(({ napiModule }) => {
  const binding = napiModule.exports

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
