define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var IdentityAccessManager = require("modules/common/controllers/identity-access-management");
    var PageView = require("../views/admin-dashboard-page");

    /** Module definition **/
    App.module("AdminDashboardPageModule", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             *  Setup routes for this module
             */
            appRoutes: {
                "!admin/dashboard(/)": "adminDashboardPageRoute"
            },

            /**
             *  When the route route is hit, we want to show the correct view.
             */
            adminDashboardPageRoute: function() {
                if (!App.IdentityAccessManagement.Controller.sessionExists()) {
                    return Backbone.history.navigate("/!admin", {
                        trigger: true,
                        replace: true
                    });
                }

                App.appWrap.getRegion("app").show(new Module.View());
            }

        });

    });

});