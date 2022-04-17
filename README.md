# Checking Webassembly Python performance

Roadmap:

1. Compare CPython performance inside Wasm with the native version
   * RESULT: Wasmer Python 3.6 package is 3~4 times slower than Docker equivalent

2. Find obvious bottlenecks with perf profiler.
   * In particular: how is the super-optimized "dict" implementation working there?

3. See if we can help it with native implementations via WASI
   * Would it help providing native/JS support for dict?
   * How hard is this?


# Tests
## Baseline: timeit(chaos) on Python 3.7~3.8 / Ubuntu 20.04 LTS

> $ python3 -OO timeit_chaos.py 
> Python version: 3.8.10 (default, Nov 26 2021, 20:14:08) 
> [GCC 9.3.0]
> Running 3 times, 10X chaos.create_image_chaos(256, 256, 5000, None, 1234)
> Results: [1.0582896230043843, 1.0635562899988145, 1.0676946610037703]

> $ python3.7m timeit_chaos.py 
> Python version: 3.7.5 (default, Nov  7 2019, 10:50:52) 
> [GCC 8.3.0]
> Running 3 times, 10X chaos.create_image_chaos(256, 256, 5000, None, 1234)
> Results: [1.0706902669917326, 1.080822388001252, 1.0957211490022019]

## Python 3.6 inside Wasmer Runtime with WAPM

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

## Python 3.6 inside Docker for "fair" comparison

To run Python inside Docker at full performance you need to run with `--privileged`.
Otherwise this "chaos" benchmark runs 2 times slower than normal.
More here: https://betterprogramming.pub/faster-python-in-docker-d1a71a9b9917

```sh
$ docker run --privileged -it -v $(pwd):/timeit python:3.6.7-slim python3 /timeit/timeit_chaos.py
Python version: 3.6.7 (default, Nov 16 2018, 06:39:52) 
[GCC 6.3.0 20170516]
Running 3 times, 10X chaos.create_image_chaos(256, 256, 5000, None, 1234)
Results: [1.7129197780159302, 1.7158629359910265, 1.72629954200238]
```

The fastest Dockerized version of Python 3.6 I found in Ubuntu 18.04 LTS:
```sh
$ docker run --privileged -it -v $(pwd):/timeit ubuntu:18.04
root@0ca611b88b4f:/# apt update -qq && apt -qqy install python3
root@0ca611b88b4f:/# python3 /timeit/timeit_chaos.py 
Python version: 3.6.9 (default, Mar 15 2022, 13:55:28) 
[GCC 8.4.0]
Running 3 times, 10X chaos.create_image_chaos(256, 256, 5000, None, 1234)
Results: [1.2719353629800025, 1.2802914009953383, 1.3168919019808527]
```

This is slower than native Python 3.8, but 3X faster than Wasm Python

FYI, Python 3.10 on Ubuntu 22.04 performs even faster than native Python 3.8 on my system:
```sh
$ docker run --privileged -it -v $(pwd):/timeit ubuntu:22.04
root@bf895c691d99:/# apt update -qq && apt -qqy install python3
root@bf895c691d99:/# python3 /timeit/timeit_chaos.py
Python version: 3.10.4 (main, Apr  2 2022, 09:04:19) [GCC 11.2.0]
Running 3 times, 10X chaos.create_image_chaos(256, 256, 5000, None, 1234)
Results: [1.016348460019799, 1.0164656820124947, 1.0231910739967134]
```

So the Python version does make a difference, at least in Docker performance.


# Other recipes

## Install & run pyperformance inside Ubuntu 18.04 Docker:
```sh
apt update && apt install python3-pip python3-venv
pip3 install pyperformance
pyperformance run -fb chaos
```
