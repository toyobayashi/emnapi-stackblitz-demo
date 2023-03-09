- CMake `>= 3.13`
- Emscripten `>= 3.1.9`
- wasi-sdk `whitequark/wasi-sdk#ac5d8fa` [WebAssembly/wasi-sdk#301](https://github.com/WebAssembly/wasi-sdk/pull/301)
- ninja

```
npm install
./build.sh

node ./index-emscripten.js
node ./index-wasi.js
```
