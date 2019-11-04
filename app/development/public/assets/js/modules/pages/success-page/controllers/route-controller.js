define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var LandingPageView = require("../views/success-page");

    /** Module definition **/
    App.module("SuccessPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             *  Setup routes for this module
             */
            appRoutes: {
                "!success(/)(?message=:message)": "successPageRoute"
            },

            /**
             *  When the (/) route is hit, we want to show the correct view.
             */
            successPageRoute: function(message){
                App.appWrap.getRegion("app").show(new Module.View({message:message}));
            }

        });

    });

});