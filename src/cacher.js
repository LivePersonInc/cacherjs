;(function (root, factory) {
    "use strict";

    /* istanbul ignore if */
    //<amd>
    if ("function" === typeof define && define.amd) {

        // AMD. Register as an anonymous module.
        define("cacher", ["exports"], function () {
            if (!root.Cacher) {
                factory(root);
            }

            return root.Cacher;
        });
        return;
    }
    //</amd>
    /* istanbul ignore else */
    if ("object" === typeof exports) {
        // CommonJS
        factory(exports);
    }
    else {
        factory(root);
    }
}(typeof CacherRoot === "undefined" ? this : CacherRoot , function (root) {
    "use strict";

    /*jshint validthis:true */

    /**
     * Cacher constructor
     * @constructor
     * @param {Object} [options] - the configuration options for the instance
     * @param {Number} [options.max] - optional max items in cache
     * @param {Number} [options.ttl] - optional TTL for each cache item
     * @param {Number} [options.interval] - optional interval for eviction loop
     * @param {Function} [options.ontimeout] - optional global handler for timeout of items in cache
     * @param {Array} [options.stores] - optional array of stores by priority
     * @param {Function} [options.oncomplete] - optional callback for loading completion
     */
    function Cacher(options) {
        // For forcing new keyword
        if (false === (this instanceof Cacher)) {
            return new Cacher(options);
        }

        this.initialize(options);
    }

    Cacher.prototype = (function () {
        /**
         * Method for initialization
         * @param {Object} [options] - the configuration options for the instance
         * @param {Number} [options.max] - optional max items in cache
         * @param {Number} [options.ttl] - optional TTL for each cache item
         * @param {Number} [options.interval] - optional interval for eviction loop
         * @param {Function} [options.ontimeout] - optional global handler for timeout of items in cache - return false if you want the item to not be deleted after ttl
         * @param {Array} [options.stores] - optional array of stores by priority
         * @param {Function} [options.oncomplete] - optional callback for loading completion
         */
        function initialize(options) {
            var that = this;
            var stop = false;
            var index = 0;

            function addItem(err, item) {
                that.nostore = true;
                set.call(that, item.key, item.value, item.ttl);
                delete that.nostore;
            }

            if (!this.initialized) {
                options = options || {};

                this.cache = {};                                                                                           // Objects cache
                this.length = 0;                                                                                           // Amount of items in cache
                this.max = !isNaN(options.max) && 0 < options.max ? parseInt(options.max, 10) : 0;                         // Maximum items in cache - 0 for unlimited
                this.ttl = !isNaN(options.ttl) && 0 < options.ttl ? parseInt(options.ttl, 10) : 0;                         // Time to leave for items (this can be overidden for specific items using the set method - 0 for unlimited
                this.interval = !isNaN(options.interval) && 0 < options.interval ? parseInt(options.interval, 10) : 1000;  // Interval for running the eviction loop
                this.ontimeout = "function" === typeof options.ontimeout ? options.ontimeout : function () {
                };              // Callback for timeout of items
                this.stores = options.stores || [];

                while (index < this.stores.length && !stop) {
                    if (this.stores[index].autoload && this.stores[index].load) {
                        stop = true;
                        this.stores[index].load({
                            onitem: addItem,
                            oncomplete: options.oncomplete
                        });
                    }

                    index++;
                }

                this.initialized = true;

                _evict.call(this);
            }
        }

        /**
         * Method for getting an item from the cache
         * @param {String} key - the key for the item
         * @param {Boolean} [pop = false] - a boolean flag indicating whether to also pop/remove the item from cache
         * @returns {Object} the item from cache
         */
        function get(key, pop) {
            var item = pop ? remove.call(this, key) : this.cache && this.cache[key] && this.cache[key].item;
            return item;
        }

        /**
         * Method for setting an item to the cache
         * @param {String} key - the key for the item to be cached
         * @param {Object} item - the item to cache
         * @param {Number} [ttl] - the time to live for the item inside the cache
         * @param {Function} [callback] - optional callback to be called on item timeout - return false if you want the item to not be deleted after ttl
         */
        function set(key, item, ttl, callback) {
            return _insert.call(this, key, item, ttl, callback);
        }

        /**
         * Method for removing an item from the cache
         * @param {String} key - the key for the item to be removed
         * @returns {Object} the item that was removed from cache
         */
        function remove(key) {
            var item = this.cache && this.cache[key] && this.cache[key].item;

            if (item) {
                this.cache[key].item = null;
                this.cache[key].callback = null;
                this.cache[key].timeout = null;
                this.cache[key] = null;
                delete this.cache[key];
                this.length--;

                _syncStores.call(this, "remove", key);
            }

            return item;
        }

        /**
         * Method for removing all items from the cache
         */
        function removeAll() {
            if (this.length) {
                for (var key in this.cache) {
                    if (this.cache.hasOwnProperty(key)) {
                        remove.call(this, key);
                    }
                }
            }
        }

        /**
         * Method for syncing with stores
         * @param {String} action - the sync action (add, remove)
         * @param {String} key - the key for the item to be removed
         * @param {Object} item - the item to cache
         * @param {Number} ttl - the time to live for the item inside the cache
         * @private
         */
        function _syncStores(action, key, item, ttl) {
            if (!this.nostore) {
                for (var i = 0; i < this.stores.length; i++) {
                    if (this.stores[i][action]) {
                        this.stores[i][action](key, item, ttl);
                    }
                    else if (this.stores[i].save) {
                        this.stores[i].save({
                            items: this.cache
                        });
                    }
                }
            }
        }

        /**
         * Method for rejecting the promise
         * @param {String} key - the key for the item to be cached
         * @param {Object} item - the item to cache
         * @param {Number} ttl - the time to live for the item inside the cache
         * @param {Function} callback - optional callback to be called on item timeout
         * @returns {Boolean} indication whether the item had been added to the cache or not (since the cache is full)
         * @private
         */
        function _insert(key, item, ttl, callback) {
            var eviction;
            var timeout;

            if (0 === this.max || this.length < this.max) {
                eviction = (!isNaN(ttl) ? parseInt(ttl, 10) : this.ttl);

                this.cache[key] = {
                    item: item
                };

                this.length++;

                if (eviction) {
                    timeout = (new Date()).getTime() + eviction;
                    this.cache[key].timeout = timeout;
                }

                if ("function" === typeof callback) {
                    this.cache[key].callback = callback;
                }

                _syncStores.call(this, "set", key, item, ttl);

                if (eviction && (this.cache[key].callback || "function" === typeof this.ontimeout)) {
                    _evict.call(this);
                }

                return true;
            }
            else {
                return false;
            }
        }

        /**
         * Method for evicting expired items from the cache
         * @private
         */
        function _evict() {
            var callback;
            var item;
            var cbRes;
            var timeoutRes;

            if (this.timer) {
                clearTimeout(this.timer);
            }

            if (this.length) {
                for (var key in this.cache) {
                    if (this.cache.hasOwnProperty(key) && this.cache[key].timeout && this.cache[key].timeout <= (new Date()).getTime()) {
                        item = this.cache[key].item;
                        callback = this.cache[key].callback;

                        if (callback) {
                            cbRes = callback(key, item);
                        }

                        if (this.ontimeout) {
                            timeoutRes = this.ontimeout(key, item);
                        }

                        // Now remove it
                        if (cbRes !== false && timeoutRes !== false) {
                            remove.call(this, key);
                        }
                    }
                }
            }

            this.timer = setTimeout(_evict.bind(this), this.interval);
        }

        return {
            initialize: initialize,
            get: get,
            set: set,
            remove: remove,
            removeAll: removeAll
        };
    }());

// attach properties to the exports object to define
// the exported module properties.
    root.Cacher = root.Cacher || Cacher;
}))
;

