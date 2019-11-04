define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var LandingPageView = require("../views/the-research");

    /** Module definition **/
    App.module("TheResearchPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             * Setup routes for this module
             */
            appRoutes: {
                "!the-research(#:anchor)(/)": "theResearchPageRoute"
            },

            /**
             * When the /about route is hit, we want to show the correct view.
             */
            theResearchPageRoute: function(anchor){
                App.appWrap.getRegion("app").show(new Module.View({anchor: anchor}));
            }

        });

    });

});