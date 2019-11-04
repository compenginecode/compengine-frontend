define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var Source = require("./source");
    var SearchMeta = require("modules/pages/browse/models/search-meta");

    /** Module definition **/
    App.module("Browse.BrowseSourcePage.Models", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.SourceCollection = Backbone.Collection.extend({

            url:  App.apiEndpoint() + "/sources/browse",

            model: Module.Source,

            parse: function (response) {
                this.searchMeta = new App.Browse.Models.SearchMeta({
                    time: response.time,
                    total: response.total
                });

                return response.sources;
            }

        });

    });

});