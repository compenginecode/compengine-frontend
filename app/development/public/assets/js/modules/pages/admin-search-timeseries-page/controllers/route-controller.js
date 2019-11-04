define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var IdentityAccessManager = require("modules/common/controllers/identity-access-management");
    var PageView = require("../views/admin-search-timeseries-page");

    /** Module definition **/
    App.module("AdminSearchTimeseriesPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             *  Setup routes for this module
             */
            appRoutes: {
                "!admin/timeseries/search(/)": "searchTimeseriesPageRoute"
            },

            /**
             *  When the route route is hit, we want to show the correct view.
             */
            searchTimeseriesPageRoute: function() {
                if (!App.IdentityAccessManagement.Controller.sessionExists()) {
                    return Backbone.history.navigate("/!admin", {
                        trigger: true,
                        replace: true
                    });
                }

                var collection = new Module.Models.SearchTimeseriesCollection();
                collection.fetch().then(function () {
                    App.appWrap.getRegion("app").show(new Module.View({collection: collection}));
                });
            }

        });

    });

});