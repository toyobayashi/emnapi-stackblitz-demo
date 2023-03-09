cmake_minimum_required(VERSION 3.13)

project(emnapi-stackblitz-demo)

add_subdirectory("${CMAKE_CURRENT_SOURCE_DIR}/node_modules/emnapi")

if(CMAKE_SYSTEM_NAME STREQUAL "Emscripten")
  add_executable(demo_emscripten binding.cpp)
  target_compile_options(demo_emscripten PRIVATE "-pthread")
  target_link_libraries(demo_emscripten emnapi-mt)
  target_link_options(demo_emscripten PRIVATE
    "-sALLOW_MEMORY_GROWTH=1"
    "-sEXPORTED_FUNCTIONS=['_malloc','_free']"
    "-pthread"
    "-sMODULARIZE=1"
    "-sEXPORT_NAME=demo"
    "-sPTHREAD_POOL_SIZE=4"
    "-sSTACK_SIZE=2MB"
    "-sDEFAULT_PTHREAD_STACK_SIZE=2MB"
  )
elseif(CMAKE_C_COMPILER_TARGET STREQUAL "wasm32-wasi-threads")
  add_executable(demo_wasi_threads binding.cpp)
  set_target_properties(demo_wasi_threads PROPERTIES SUFFIX ".wasm")
  target_compile_definitions(demo_wasi_threads PRIVATE "NAPI_DISABLE_CPP_EXCEPTIONS")
  target_link_libraries(demo_wasi_threads emnapi-mt)
  target_compile_options(demo_wasi_threads PRIVATE "-fno-exceptions" "-pthread")
  target_link_options(demo_wasi_threads PRIVATE
    "-pthread"
    "-mexec-model=reactor"
    "-Wl,--import-memory"
    "-Wl,--max-memory=2147483648"
    "-Wl,--export-dynamic"
    "-Wl,--export=malloc"
    "-Wl,--export=free"
    "-Wl,--import-undefined"
    "-Wl,--export-table"
  )
  if(CMAKE_BUILD_TYPE STREQUAL "Release")
    target_link_options(demo_wasi_threads PRIVATE
      "-Wl,--strip-debug"
    )
  endif()
endif()
