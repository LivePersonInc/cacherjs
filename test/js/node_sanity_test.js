var expect = require('chai').expect;
var sinon = require('sinon');
var requireHelper = require('./util/require_helper');
var LPTtlCache = requireHelper("lpTtlCache").LPTtlCache;
var TtlCacheFileStore = requireHelper("/stores/ttlCacheFileStore").TtlCacheFileStore;

describe('lp-ttl-cache Node Sanity Tests', function () {
    describe("simple get/set with ttl test", function () {
        var ttlCache;

        before(function () {
            ttlCache = new LPTtlCache({
                ttl: 10,
                interval: 5
            });

        });

        it("should create an instance", function () {
            expect(ttlCache).to.be.defined;
        });

        it("should not return something that is not there", function () {
            expect(ttlCache.get("key1")).to.be.undefined;
        });


        it("should get and set correctly", function () {
            var ret = ttlCache.set("key1", "someValue");
            expect(ret).to.be.true;
            expect(ttlCache.get("key1")).to.equal("someValue");
        });

        it("should override the key correctly", function () {
            var ret = ttlCache.set("key1", "someValue");
            expect(ret).to.be.true;
            ret = ttlCache.set("key1", "someOtherValue");
            expect(ret).to.be.true;
            expect(ttlCache.get("key1")).to.equal("someOtherValue");
        });

        it("should remove the key correctly", function () {
            var ret = ttlCache.set("key1", "someValue");
            expect(ret).to.be.true;
            expect(ttlCache.remove("key1")).to.equal("someValue");
            expect(ttlCache.get("key1")).to.be.undefined;
        });

        it("should remove all keys correctly", function () {
            ttlCache.set("key1", "someValue1");
            ttlCache.set("key2", "someValue2");
            ttlCache.set("key3", "someValue3");
            ttlCache.set("key4", "someValue4");
            ttlCache.removeAll();
            expect(ttlCache.get("key1")).to.be.undefined;
            expect(ttlCache.get("key2")).to.be.undefined;
            expect(ttlCache.get("key3")).to.be.undefined;
            expect(ttlCache.get("key4")).to.be.undefined;
        });

        it("should evict on timeout", function (done) {
            var ret = ttlCache.set("key2", "someValue");
            expect(ret).to.be.true;
            setTimeout(function () {
                expect(ttlCache.get("key2")).to.be.undefined;
                done();
            }, 20);
        });

        it("should evict on timeout without deleting", function (done) {
            var ret = ttlCache.set("key2", "someValue", null, function(key) {
                expect(key).to.equal("key2");
                return false;
            });
            expect(ret).to.be.true;
            setTimeout(function () {
                expect(ttlCache.get("key2")).to.equal("someValue");
                done();
            }, 20);
        });
    });

    describe("simple get/set with ttl test", function () {
        var ttlCache;
        var cacheFilePath = __dirname + "/../resources/test_cache_file.json";

        before(function (done) {
            ttlCache = new LPTtlCache({
                oncomplete: function() { done(); },
                stores: [ new TtlCacheFileStore({
                    file: cacheFilePath,
                    autoload: true
                })]
            });
        });

        function requireReload(module){
            delete require.cache[require.resolve(module)];
            return require(module);
        }

        it("should create an instance", function (done) {
            expect(ttlCache).to.be.defined;
            expect(ttlCache.get("key1")).to.equal("value1");
            ttlCache.set("key3", "value3");

            setTimeout(function() {
                var cacheFile = require(cacheFilePath);

                expect(cacheFile.cache.items[2].key).to.equal("key3");
                expect(cacheFile.cache.items[2].value).to.equal("value3");
                expect(cacheFile.cache.items[2].timeout).to.equal(0);

                ttlCache.remove("key3");

                setTimeout(function() {
                    var cacheFile = requireReload(cacheFilePath);

                    expect(cacheFile.cache.items[2]).to.be.undefined;

                    done();
                }, 100);
            }, 100);
        });
    });

});
