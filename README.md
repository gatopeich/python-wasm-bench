# Checking Webassembly Python performance

Roadmap:

1. Compare CPython performance inside Wasm with the native version

2. Find obvious bottlenecks with perf profiler.
..+ In particular: how is the super-optimized "dict" implementation working there?

3. See if we can help it with native implementations via WASI
..+ Would it help providing native/JS support for dict?
..+ How hard is this?

# Getting Python inside Wasmer Runtime with WAPM

```sh
curl https://get.wasmer.io -sSfL | sh
wapm install python
ln -s timeit_chaos.py wapm_packages/python/python@0.1.0/lib/
wasmer wapm_packages/python/python@0.1.0/bin/python.wasm --mapdir=lib:wapm_packages/python/python@0.1.0/lib
```

> Python version: 3.6.7 (default, Feb 14 2020, 03:17:48) 
> [Wasm WASI vClang 9.0.0 (https://github.com/llvm/llvm-project 0399d5a9682b3cef7
> Running 3 times, 10X chaos.create_image_chaos(256, 256, 5000, None, 1234)
> Results: [4.7373856409976725, 4.742638655996416, 4.743080985004781]
