define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var PageView = require("../views/contribution-info-page");

    /** Module definition **/
    App.module("ContributionInfoPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             *  Setup routes for this module
             */
            appRoutes: {
                "!contribution-info(/)": "contributionInfoPageRoute"
            },

            /**
             *  When the about route is hit, we want to show the correct view.
             */
            contributionInfoPageRoute: function(){
                App.appWrap.getRegion("app").show(new Module.View());
            }

        });

    });

});