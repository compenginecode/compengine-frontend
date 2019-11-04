define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var LandingPageView = require("../views/bulk-contributions-page");

    /** Module definition **/
    App.module("BulkContributions", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             *  Setup routes for this module
             */
            appRoutes: {
                "!bulk-contributions(/)?token=:token": "bulkContributionsRoute"
            },

            /**
             *  When the (/) route is hit, we want to show the correct view.
             */
            bulkContributionsRoute: function(token){
                App.appWrap.getRegion("app").show(new Module.View({token: token}));
            }

        });

    });

});