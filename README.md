cacherjs
========
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)
[![Build Status](https://travis-ci.org/LivePersonInc/ttl-cache.svg)](https://travis-ci.org/LivePersonInc/ttl-cache)
[![Test Coverage](https://codeclimate.com/github/LivePersonInc/ttl-cache/badges/coverage.svg)](https://codeclimate.com/github/LivePersonInc/ttl-cache/coverage)
[![Code Climate](https://codeclimate.com/github/LivePersonInc/ttl-cache/badges/gpa.svg)](https://codeclimate.com/github/LivePersonInc/ttl-cache)
[![npm version](https://badge.fury.io/js/cacherjs.svg)](http://badge.fury.io/js/cacherjs)
[![Dependency Status](https://david-dm.org/LivePersonInc/cacherjs.svg?theme=shields.io)](https://david-dm.org/LivePersonInc/cacherjs)
[![devDependency Status](https://david-dm.org/LivePersonInc/cacherjs/dev-status.svg?theme=shields.io)](https://david-dm.org/LivePersonInc/cacherjs#info=devDependencies)
[![npm downloads](https://img.shields.io/npm/dm/cacherjs.svg)](https://img.shields.io/npm/dm/cacherjs.svg)
[![NPM](https://nodei.co/npm/cacherjs.png)](https://nodei.co/npm/cacherjs/)

> JS TTL Cache Mechanism.

This is a UMD module that can be used as AMD module, native and NodeJS.

Getting Started
---------------

Run `npm install cacherjs`

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

API
----------
### get (key, [optional]pop)
Will get the value associated with the given `key`.
`pop` is a boolean flag indicating whether to also pop/remove the item from cache.

### set (key, value, [optional]ttl, [optional]callback)
Will set `value` and associate it with the given `key`.
`ttl` will override the time to live for the item inside the cache.
`callback` will be called on item timeout - return false if you want the item to not be deleted after ttl

### remove (key)
Will remove `key` from cache.

### removeAll
Will clean the cache completely

Example
-----------
```javascript
var Cacher = require("cacherjs").Cacher;
var cache = new Cacher({
    ttl: 10,
    interval: 5
});
ttlCache.set("key1", "someValue");
ttlCache.get("key1"); //"someValue"
```

License
----------
MIT
