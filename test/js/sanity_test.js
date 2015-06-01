var expect = require('chai').expect;
var requireHelper = require('./util/require_helper');
var Cacher = requireHelper("cacher").Cacher;

describe('lp-ttl-cache Sanity Tests', function () {

    describe("simple get/set with ttl test", function () {
        var ttlCache;

        before(function () {
            ttlCache = new Cacher({
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

});
