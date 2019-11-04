define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Module definition **/
    App.module("TimeseriesPage.Models", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.Timeseries = Backbone.Model.extend({

            /**
             *  Returns the root URL for this resource.
             *
             * @returns {string}
             */
            urlRoot: function(){
                return App.apiEndpoint() + "/timeseries";
            }

        });

    });

});