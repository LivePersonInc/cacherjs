lp-ttl-cache
========
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)
[![Build Status](https://travis-ci.org/LivePersonInc//ttl-cache.svg)](https://travis-ci.org/LivePersonInc//ttl-cache)

> JS TTL Cache Mechanism.

This is a UMD module that can be used as AMD module, native and NodeJS.

Getting Started
---------------

Run `npm install ttl-cache`

Overview
-------------

A TTL cache mechanism with the following options at instance creation

#### options.max
Type: `Number`
Default value: `0`

optional max items in cache - 0 is unlimited

#### options.ttl
Type: `Number`
Default value: `0`

optional TTL for each cache item - 0 is unlimited

#### options.interval
Type: `Number`
Default value: `1000`

optional interval for eviction loop in milliseconds

#### options.ontimeout
Type: `Function`
Default value: `Empty function`

optional global handler for timeout of items in cache

License
----------
MIT
