let fs, WASI, emnapiCore
const isNodeLike = typeof process !== 'undefined' && process.versions && typeof process.versions.node === 'string'

if (isNodeLike) {
  const nodeWorkerThreads = require('worker_threads')

  const parentPort = nodeWorkerThreads.parentPort

  parentPort.on('message', (data) => {
    globalThis.onmessage({ data })
  })

  fs = require('fs')

  Object.assign(globalThis, {
    self: globalThis,
    require,
    Worker: nodeWorkerThreads.Worker,
    importScripts: function (f) {
      (0, eval)(fs.readFileSync(f, 'utf8') + '//# sourceURL=' + f)
    },
    postMessage: function (msg) {
      parentPort.postMessage(msg)
    }
  })

  // native Node.js
  // WASI = require('wasi').WASI
  WASI = require('@tybys/wasm-util').WASI
  emnapiCore = require('@emnapi/core')
} else {
  importScripts('./node_modules/memfs-browser/dist/memfs.js')
  importScripts('./node_modules/@tybys/wasm-util/dist/wasm-util.min.js')
  importScripts('./node_modules/@emnapi/core/dist/emnapi-core.js')
  emnapiCore = globalThis.emnapiCore

  const { Volume, createFsFromVolume } = memfs
  fs = createFsFromVolume(Volume.fromJSON({
    '/': null
  }))

  WASI = globalThis.wasmUtil.WASI
}

const { instantiateNapiModuleSync, MessageHandler } = emnapiCore

const handler = new MessageHandler({
  onLoad ({ wasmModule, wasmMemory }) {
    return instantiateNapiModuleSync(wasmModule, {
      childThread: true,
      wasi: new WASI({ fs }),
      overwriteImports (importObject) {
        importObject.env.memory = wasmMemory
      }
    })
  }
})

globalThis.onmessage = function (e) {
  handler.handle(e)
}
