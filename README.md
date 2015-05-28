lp-ttl-cache
========
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)
<!--- [![alt text][2]][1] [![alt text][4]][3] [![alt text][6]][5] [![alt text][8]][7]

 [1]: http://teamcity/viewType.html?buildTypeId=FeInfra_LpTtlCacheMaster
 [2]: http://ctvr-ci:3000/?build=FeInfra_LpTtlCacheMaster ("Teamcity build Status")

 [3]: http://teamcity/viewType.html?buildTypeId=FeInfra_LpTtlCacheMaster
 [4]: http://ctvr-ci:3000/?build=FeInfra_LpTtlCacheMaster&type=cov ("Coverage")

 [5]: http://teamcity/viewType.html?buildTypeId=FeInfra_LpTtlCacheMaster
 [6]: http://ctvr-ci:3000/?build=FeInfra_LpTtlCacheMaster&type=test ("Tests")

 [7]: http://teamcity/viewType.html?buildTypeId=FeInfra_LpTtlCacheMaster
 [8]: http://ctvr-ci:3000/?type=npm&artifact=lp-ttl-cache ("NPM") -->

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
