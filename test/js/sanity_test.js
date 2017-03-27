var expect = require('chai').expect;
var requireHelper = require('./util/require_helper');
var Cacher = requireHelper("cacher").Cacher;

describe('lp-ttl-cache Sanity Tests', function () {

    describe("simple get/set with ttl test", function () {
        var ttlCache;
        var ttlCacheMaxNoAdd;
        var ttlCacheMaxClosestTTL;

        before(function () {
            ttlCache = new Cacher({
                ttl: 10,
                interval: 5
            });
            ttlCacheMaxNoAdd = new Cacher({
                ttl: 60000,
                interval: 2000,
                max: 2,
                maxStrategy: Cacher.MAX_STRATEGY.NO_ADD
            });
            ttlCacheMaxClosestTTL = new Cacher({
                ttl: 60000,
                interval: 2000,
                max: 2,
                maxStrategy: Cacher.MAX_STRATEGY.CLOSEST_TTL
            });
        });

        it("should create an instance", function () {
            expect(ttlCache).to.be.defined;
            expect(ttlCacheMaxNoAdd).to.be.defined;
            expect(ttlCacheMaxClosestTTL).to.be.defined;
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

        it("should not add on max reached", function (done) {
            var ret = ttlCacheMaxNoAdd.set("key1", "someValue", null, function(key) {
                expect(key).to.equal("key1");
                return false;
            });
            expect(ret).to.be.true;

            setTimeout(function () {
                ret = ttlCacheMaxNoAdd.set("key2", "someValue", null, function (key) {
                    expect(key).to.equal("key2");
                    return false;
                });
                expect(ret).to.be.true;
                ret = ttlCacheMaxNoAdd.set("key3", "someValue", null, function (key) {
                    expect(key).to.equal("key3");
                    return false;
                });
                expect(ret).to.be.false;
                setTimeout(function () {
                    expect(ttlCacheMaxNoAdd.get("key1")).to.equal("someValue");
                    expect(ttlCacheMaxNoAdd.get("key2")).to.equal("someValue");
                    expect(ttlCacheMaxNoAdd.get("key3")).to.be.undefined;
                    done();
                }, 20);
            }, 20);
        });

        it("should kickout on max reached", function (done) {
            var called = false;
            var ret = ttlCacheMaxClosestTTL.set("key1", "someValue", null, function(key) {
                expect(key).to.equal("key1");
                called = true;
                return false;
            });
            expect(ret).to.be.true;

            setTimeout(function () {
                ret = ttlCacheMaxClosestTTL.set("key2", "someValue", null, function (key) {
                    expect(key).to.equal("key2");
                    return false;
                });
                expect(ret).to.be.true;
                ret = ttlCacheMaxClosestTTL.set("key3", "someValue", null, function (key) {
                    expect(key).to.equal("key3");
                    return false;
                });
                expect(ret).to.be.true;
                setTimeout(function () {
                    expect(called).to.be.true;
                    expect(ttlCacheMaxClosestTTL.get("key1")).to.be.undefined;
                    expect(ttlCacheMaxClosestTTL.get("key2")).to.equal("someValue");
                    expect(ttlCacheMaxClosestTTL.get("key3")).to.equal("someValue");
                    done();
                }, 20);
            }, 20);
        });
    });

});
