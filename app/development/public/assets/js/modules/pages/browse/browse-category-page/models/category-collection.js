define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var Category = require("./category");
    var SearchMeta = require("modules/pages/browse/models/search-meta");

    /** Module definition **/
    App.module("Browse.BrowseCategoryPage.Models", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.CategoryCollection = Backbone.Collection.extend({

            url:  App.apiEndpoint() + "/categories/browse",

            model: Module.Category,

            parse: function (response) {
                this.searchMeta = new App.Browse.Models.SearchMeta({
                    time: response.time,
                    total: response.total
                });

                return response.categories;
            }

        });

    });

});