define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var LandingPageView = require("../views/contact");

    /** Module definition **/
    App.module("ContactPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             * Setup routes for this module
             */
            appRoutes: {
                "!contact(/)": "contactPageRoute"
            },

            /**
             * When the /about route is hit, we want to show the correct view.
             */
            contactPageRoute: function(){
                App.appWrap.getRegion("app").show(new Module.View());
            }

        });

    });

});