define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var LandingPageView = require("../views/demo-graph");

    /** Module definition **/
    App.module("DemoGraph", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             * Setup routes for this module
             */
            appRoutes: {
                "!demo(/)": "demoGraphPageRoute"
            },

            /**
             * When the /demo route is hit, we want to show the correct view.
             */
            demoGraphPageRoute: function(){
                App.appWrap.getRegion("app").show(new Module.View());
            }

        });

    });

});