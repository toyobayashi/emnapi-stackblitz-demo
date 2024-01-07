#!/bin/bash

mkdir -p build/wasm32-unknown-emscripten
mkdir -p build/wasm32-wasi-threads

emcmake cmake -DCMAKE_BUILD_TYPE=Release -DEMNAPI_WORKER_POOL_SIZE=4 -DEMNAPI_FIND_NODE_ADDON_API=ON -G Ninja -H. -Bbuild/wasm32-unknown-emscripten
cmake --build build/wasm32-unknown-emscripten

cmake -DCMAKE_TOOLCHAIN_FILE=$WASI_SDK_PATH/share/cmake/wasi-sdk-pthread.cmake \
      -DEMNAPI_FIND_NODE_ADDON_API=ON \
      -DWASI_SDK_PREFIX=$WASI_SDK_PATH \
      -DCMAKE_BUILD_TYPE=Release \
      -G Ninja -H. -Bbuild/wasm32-wasi-threads

cmake --build build/wasm32-wasi-threads

mkdir -p out/wasm32-unknown-emscripten
mkdir -p out/wasm32-wasi-threads
cp -rpf ./build/wasm32-unknown-emscripten/demo_emscripten.* ./out/wasm32-unknown-emscripten
cp -rpf ./build/wasm32-wasi-threads/demo_wasi_threads.* ./out/wasm32-wasi-threads
