define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var LandingPageView = require("../views/landing-page");

    /** Module definition **/
    App.module("LandingPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             *  Setup routes for this module
             */
            appRoutes: {
                "(!)(/)": "landingPageRoute"
            },

            /**
             *  When the (/) route is hit, we want to show the correct view.
             */
            landingPageRoute: function(){
                App.appWrap.getRegion("app").show(new Module.View());
            }

        });

    });

});