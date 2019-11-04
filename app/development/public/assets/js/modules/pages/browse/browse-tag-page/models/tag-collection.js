define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var Tag = require("./tag");
    var SearchMeta = require("modules/pages/browse/models/search-meta");

    /** Module definition **/
    App.module("Browse.BrowseTagPage.Models", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.TagCollection = Backbone.Collection.extend({

            url:  App.apiEndpoint() + "/tags/browse",

            model: Module.Tag,

            parse: function (response) {
                this.searchMeta = new App.Browse.Models.SearchMeta({
                    time: response.time,
                    total: response.total
                });

                return response.tags;
            }

        });

    });

});