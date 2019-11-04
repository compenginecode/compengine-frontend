/**
 *  Configuration storage module
 *
 * @module common/controllers/configuration-store
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Define module **/
    App.module("ConfigurationStore", function(Module, Application, Backbone){

        /** Define controller **/
        Module.Controller = Marionette.Object.extend({

            /**
             * On initialization, we'll setup the Object.
             */
            initialize: function() {
                if(!window.GLOBAL || !window.GLOBAL.settings) {
                    /** Show error page **/
                    // window.location = "#oh-no";

                    window.GLOBAL = {
                        version: "undefined",
                        settings: {},
                        exportedDataSizes: {
                            csv: null,
                            json: null
                        },
                        timeSeriesCount: 0
                    };
                }
            },


            /**
             * Get the current app version
             *
             * @returns string
             */
            getAppVersion: function() {
                /**
                 * We want to make sure we're not dealing with "undefined" instead of the real value.
                 */
                if(!window.GLOBAL.version) {
                    throw new Error("The API version is not defined");
                }

                return "f" + App.frontEndVersion + "-a" + window.GLOBAL.version;
            },

            /**
             * Get the maximum file size that can be sent to the server
             *
             * @returns {number}
             */
            getMaxFileSize: function() {
                /**
                 * We want to make sure we're not dealing with "undefined" instead of the real value.
                 */
                if(!window.GLOBAL.settings.hardFileSizeLimit) {
                    throw new Error("The maximimum file size limit is not defined");
                }

                return window.GLOBAL.settings.hardFileSizeLimit;
            },

            /**
             * Get an array of the statistics messages.
             *
             * @returns {Array}
             */
            getStatisticsMessages: function() {
                /**
                 * We want to make sure we're not dealing with "undefined" instead of the real value.
                 */
                if(!window.GLOBAL.statisticsMessages) {
                    throw new Error("The maximimum file size limit is not defined");
                }

                return window.GLOBAL.statisticsMessages;
            },

            /**
             * Get an array of the supported file extensions
             *
             * @param enableGrammar If enabled, returns it in a readable format.
             * @returns {Array|string}
             */
            getSupportedFileExtensions: function(enableGrammar) {
                var returnValue;

                if(!window.GLOBAL.settings.supportedFileExtensions) {
                    /** Fallback **/
                    returnValue = [".csv", ".txt", ".xlsx", ".wav", ".mp3"];
                } else {
                    returnValue = window.GLOBAL.settings.supportedFileExtensions;
                }

                if(enableGrammar) {
                    if(returnValue.length < 2) {
                        return returnValue;
                    }

                    return returnValue.slice(0, returnValue.length - 1).join(", ") +
                        " or " + returnValue[returnValue.length - 1];
                }

                /** If grammar is not enabled **/
                return returnValue.join(", ");
            },

            /**
             * Returns the Comparison result timeout value.
             *
             * @returns {number}
             */
            getComparisonResultTimeout: function() {
                if(!window.GLOBAL.settings.comparisonResultTimeout) {
                    return 8.64e+7;
                } else {
                    return window.GLOBAL.settings.comparisonResultTimeout;
                }
            },

            getMaxTotalBulkUploadSize: function () {
                if(!window.GLOBAL.settings.maxTotalBulkUploadSize) {
                    return 1e+10;
                } else {
                    return window.GLOBAL.settings.maxTotalBulkUploadSize;
                }
            },

            /**
             * Get the exported data sizes from the server (Each value can be NULL|Integer)
             *
             * @returns {Object} If one of the file types do not exist, their value will be NULL not an integer.
             */
            getExportedDataSizes: function() {
                return window.GLOBAL.exportedDataSizes;
            },

            /**
             * Returns whether or not the app should be in debug mode.
             *
             * @returns {boolean}
             */
            debugEnabled: function() {
                return true;
            },

            getTimeSeriesCount: function () {
                return window.GLOBAL.timeSeriesCount;
            }

        });

    });

});