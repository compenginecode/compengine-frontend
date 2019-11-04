define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Module definition **/
    App.module("VisualizePage.Filtering", function(Module, Application, Backbone){

        /** Define model **/
        Module.Filters = Backbone.Model.extend({

            defaults: {
                topLevelCategory: 'any',
                source: '',
                tags: []
            }

        });

    });

});