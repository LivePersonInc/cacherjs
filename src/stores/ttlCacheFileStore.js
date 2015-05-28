;(function (root, factory) {
    "use strict";
    factory(root, exports, require("util"), require("fs"), require("JSONStream"), require("event-stream"));
}(this, function (root, exports, util, fs, JSONStream, eventStream) {
    "use strict";

    /*jshint validthis:true */

    /**
     * TtlCacheFileStore constructor
     * @constructor
     * @param {Object} options - the configuration options for the instance
     * @param {String} options.file - file path
     * @param {Boolean} [options.autoload] - optional flag to indicate whether the cache will be loaded from the given file (defaults to false)
     * @param {Boolean} [options.ignoreExpired] - optional flag to indicate whether expired items should be ignored when loading from file (defaults to false)
     */
    function TtlCacheFileStore(options) {
        // For forcing new keyword
        if (false === (this instanceof TtlCacheFileStore)) {
            return new TtlCacheFileStore(options);
        }

        this.initialize(options);
    }

    TtlCacheFileStore.prototype = (function () {
        /**
         * Method for initialization
         * @param {Object} options - the configuration options for the instance
         * @param {String} options.file - file path
         * @param {String} [options.encoding] - optional file encoding (defaults to utf-8)
         * @param {Boolean} [options.autoload] - optional flag to indicate whether the cache will be loaded from the given file (defaults to false)
         * @param {Boolean} [options.ignoreExpired] - optional flag to indicate whether expired items should be ignored when loading from file (defaults to false)
         */
        function initialize(options) {
            if (!this.initialized) {
                options = options || {};

                this.file = options.file;
                this.encoding = options.encoding || "utf8";
                this.autoload = options.autoload;
                this.ignoreExpired = options.ignoreExpired;

                this.initialized = true;
            }
        }

        /**
         * Method for loading file
         * @param {Object} options - the parameters options for the method
         * @param {Function} [options.onconfigure] - optional callback for cache configuration (from file)
         * @param {Function} [options.onitem] - optional callback for item adding to cache (from file)
         * @param {Function} options.oncomplete - callback for file load end
         */
        function load(options) {
            var stream;
            var parser;
            var data;
            var attributes;
            var items = {};
            var that = this;

            function complete(err) {
                if (options && options.oncomplete) {
                    data = {
                        items: items
                    };

                    if (attributes) {
                        data.attributes = attributes;
                    }

                    options.oncomplete(err, data);
                }
            }

            if (this.initialized) {
                stream = fs.createReadStream(this.file, {
                    encoding: this.encoding
                });
                stream.on("error", function(err) {
                    // TODO: Add logger (DI)
                    console.log("error! " + util.inspect(err));
                    complete(err);
                });

                parser = JSONStream.parse("cache.*.*");
                parser.on("end", function() {
                    complete(null);
                });

                stream.pipe(parser).pipe(eventStream.mapSync(function (data) {
                    if (data) {
                        if (data.key) {
                            if (that.ignoreExpired || 0 === data.timeout || 0 < (data.timeout - Date.now())) {
                                items[data.key] = {
                                    value: data.value,
                                    ttl: 0 === data.timeout ? 0 : data.timeout - Date.now()
                                };
                                if (options && options.onitem) {
                                    options.onitem(null, data);
                                }
                            }
                        }
                        else {
                            attributes = data;
                            if (options && options.onconfigure) {
                                options.onconfigure(null, attributes);
                            }
                        }
                    }
                    return data;
                }));
            }
        }

        /**
         * Method for saving file
         * @param {Object} data - the parameters options for the method
         * @param {Function} [data.attributes] - optional configuration attributes of the cache
         * @param {Function} [data.items] - optional items in the cache
         */
        function save(data) {
            var writable;
            var json = {};

            if (this.initialized) {
                if (data && data.attributes) {
                    json.attributes = [ data.attributes ];
                }
                json.items = [];

                if (data && data.items) {
                    for (var attr in data.items) {
                        if (data.items.hasOwnProperty(attr)) {
                            json.items.push({
                                key: attr,
                                value: data.items[attr].item || data.items[attr],
                                timeout: data.items[attr].timeout || 0
                            });
                        }
                    }
                }

                writable = fs.createWriteStream(this.file, {
                    flags: "w",
                    encoding: this.encoding
                });
                writable.end(JSON.stringify({
                    cache: json
                }, null, 2));
            }
        }

        return {
            initialize: initialize,
            load: load,
            save: save
        };
    }());

    // attach properties to the exports object to define
    // the exported module properties.
    exports.TtlCacheFileStore = TtlCacheFileStore;
}))
;

