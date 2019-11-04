define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var LandingPageView = require("../views/error-page");

    /** Module definition **/
    App.module("ErrorPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             *  Setup routes for this module
             */
            appRoutes: {
                "!oh-no(/)(?message=:message)": "errorPageRoute"
            },

            /**
             *  When the (/) route is hit, we want to show the correct view.
             */
            errorPageRoute: function(message){
                App.appWrap.getRegion("app").show(new Module.View({message:message}));
            }

        });

    });

});