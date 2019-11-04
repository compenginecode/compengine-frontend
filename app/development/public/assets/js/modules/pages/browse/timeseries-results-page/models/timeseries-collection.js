define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var Timeseries = require("./timeseries");
    var SearchMeta = require("modules/pages/browse/models/search-meta");

    /** Module definition **/
    App.module("Browse.TimeseriesResultsPage.Models", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.TimeseriesCollection = Backbone.Collection.extend({

            url:  App.apiEndpoint() + "/time-series/search",

            model: Module.Timeseries,

            fetch: function (options) {
                options = _.extend({
                    type:         "POST"
                }, options);
                return Backbone.Collection.prototype.fetch.call(this, options);
            },

            parse: function (response) {
                this.searchMeta = new App.Browse.Models.SearchMeta({
                    time: response.time,
                    total: response.total,
                    pageSize: response.pageSize,
                    searchingBy: response.searchingBy
                });

                return response.timeSeries;
            }

        });

    });

});