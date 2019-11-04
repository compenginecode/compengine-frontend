define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var PageView = require("../views/timeseries-page");

    /** Module definition **/
    App.module("TimeseriesPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             *  Setup routes for this module
             */
            appRoutes: {
                "!visualize/:timeseriesId(/)": "timeseriesPageRoute"
            },

            /**
             *  When the route route is hit, we want to show the correct view.
             */
            timeseriesPageRoute: function(timeseriesId){
                App.appWrap.getRegion("app").show(new Module.View({
                    timeseriesId: timeseriesId
                }));
            }

        });

    });

});