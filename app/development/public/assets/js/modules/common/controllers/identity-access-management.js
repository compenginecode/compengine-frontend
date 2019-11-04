define(function(require){

    /** Require App **/
    var App = require("app");
    var SimpleStorage = require("simpleStorage");

    /** Setup Module **/
    App.module("IdentityAccessManagement", function(Module, Application, Backbone){

        /**
         * Simple storage abstraction
         *
         * @type {Object}
         * @private
         */
        var _Storage = {

            /**
             * This function will add an "object" of data to a "key" and store it inside the SimpleStorage.
             *
             * @param name {string} The key of the data you're storing
             * @param object {Object} The data you're storing
             * @param expireInSeconds {Number} Amount of seconds until expiry
             * @returns {void}
             */
            setData: function(name, object, expireInSeconds) {
                SimpleStorage.set(name, JSON.stringify(object));
                SimpleStorage.setTTL(name, expireInSeconds * 1000);
            },

            /**
             * This function will get the data associated with the given name.
             *
             * @param name {string} The key of the data you wish to get
             * @returns {Object|null} Returns an object if it found your data, otherwise it will return null.
             */
            getData: function(name) {
                var store = SimpleStorage.get(name);
                // null & undefined return the same value when it's not a strict comparator
                var foundData = null != store;

                if (foundData) {
                    return JSON.parse(store);
                }

                return null;
            },

            /**
             * Deletes the key from storage.
             *
             * @param name {string} The key you want to delete
             * @returns {void}
             */
            deleteData: function(name) {
                SimpleStorage.deleteKey(name);
            },

            /**
             * Flushes (empties) the local storage.
             *
             * @returns {void}
             */
            flush: function() {
                SimpleStorage.flush();
            },

            /**
             * Set the session key
             *
             * @param key {string} The session key
             * @param expireTimeInSeconds {Number} Amount of seconds until the key expires
             * @returns {void}
             */
            setSessionKey: function(key, expireTimeInSeconds) {
                this.setData("sessionKey", {key: key}, expireTimeInSeconds);
                this.setData("expireTime", {time: expireTimeInSeconds}, expireTimeInSeconds*2);
            },

            /**
             * Deletes the key from storage.
             *
             * @returns {string|Null} The session key or null (if no session)
             */
            getSessionKey: function() {
                var key = this.getData("sessionKey");

                if (null !== key) {
                    return key.key;
                }

                return null;
            },

            /**
             * Returns TRUE if the session exists, FALSE otherwise.
             *
             * @returns {boolean}
             */
            sessionExists: function() {
                var session = this.getSessionKey();
                return (null !== session && "undefined" !== typeof session);
            },

            /**
             * Set the time to live on a given piece of data.
             *
             * @param key {string} The key that you're setting the TTL on
             * @param expire {Number} Amount of seconds until expiry
             */
            setTTL: function(key, expire) {
                SimpleStorage.setTTL(key, expire * 1000);
            }
        };

        var Definition = Marionette.Object.extend({

            /**
             * Start the session for a given user
             *
             * @param serverPayload
             * @returns {void}
             */
            startSession: function(serverPayload) {
                /** Time the user submitted their details. **/
                this.submittedTime = new Date().getTime();
                var expectedTimeout = this.submittedTime + (serverPayload.expiry_time * 1000);

                var accessToken = serverPayload.token;
                var expiresInSeconds = serverPayload.expiry_time;

                /** Add any information into the HTML5 storage **/
                _Storage.setSessionKey(accessToken, expiresInSeconds);
                _Storage.setData("defaultExpiry", serverPayload.expiry_time);
                _Storage.setData("expiryTime", expectedTimeout);
            },

            /**
             * Check whether the session exists or not.
             *
             * @returns {boolean} True if the session exists
             */
            sessionExists: function() {
                return _Storage.sessionExists();
            },

            /**
             * Get the session key
             *
             * @returns {string|Null} Null if no session exists.
             */
            sessionKey: function() {
                return _Storage.getSessionKey();
            },

            /**
             * Kill current session
             */
            logout: function() {
                _Storage.flush();
            },

            initialize: function() {
                this.patchBackbone();
            },

            patchBackbone: function() {
                var that = this;
                var backboneSync = Backbone.sync;

                /** We update the sync method to force the sending of the auth token **/
                Backbone.sync = function (method, model, options) {
                    if (that.sessionExists()) {

                        var oldSuccess = options.success;

                        /** We monkey patch the success call, so that we can update the local session expiry on every
                         *  success. In short, when a call works, the session timeout resets.
                         *
                         * @param model
                         * @param response
                         * @param options
                         */
                        options.success = function(model, response, options) {
                            oldSuccess(model, response, options);
                        };

                        /*
                         * The jQuery "ajax" method includes a "headers" option
                         * which lets you set any headers you like
                         */
                        options.headers = {
                            /*
                             * Set the "Authorization" header and get the access
                             * token from the `auth` module
                             */
                            "Authorization": "bearer " + that.sessionKey()
                        };

                    }

                    /*
                     * Call the stored original Backbone.sync method with
                     * extra headers argument added
                     */
                    return backboneSync(method, model, options);

                };
            }

        });

        /**
         * Export the initialized controller
         *
         * @public
         */
        Module.Controller = new Definition();

    });

});