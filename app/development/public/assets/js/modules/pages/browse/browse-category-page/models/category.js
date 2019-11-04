define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    // var CategoryCollection = require("./category-collection");

    /** Module definition **/
    App.module("Browse.BrowseCategoryPage.Models", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.Category = Backbone.Model.extend({

            initialize: function () {
                var children = this.get("children");
                this.set("children", new Module.CategoryCollection(children));
            },

            toJSON: function () {
                var data = Backbone.Model.prototype.toJSON.call(this);
                if (data.children && data.children.toJSON) {
                    data.children = data.children.toJSON();
                }
                return data;
            }

        });

    });

});