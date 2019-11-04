define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var LandingPageView = require("../views/download");

    /** Module definition **/
    App.module("DownloadPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             * Setup routes for this module
             */
            appRoutes: {
                "!download(/)": "contactPageRoute"
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