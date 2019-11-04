define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var IdentityAccessManager = require("modules/common/controllers/identity-access-management");
    var PageView = require("../views/admin-bulk-contributions-requests-page");

    /** Module definition **/
    App.module("AdminBulkContributionRequests", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             *  Setup routes for this module
             */
            appRoutes: {
                "!admin/bulk-contribution-requests(/)": "adminBulkContributionRequestsRoute"
            },

            /**
             *  When the about route is hit, we want to show the correct view.
             */
            adminBulkContributionRequestsRoute: function() {
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