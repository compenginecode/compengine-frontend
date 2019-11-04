define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var IdentityAccessManager = require("modules/common/controllers/identity-access-management");
    var PageView = require("../views/admin-categories-page");
    var CategoryCollection = require("../models/category-collection");

    /** Module definition **/
    App.module("AdminCategoriesPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             *  Setup routes for this module
             */
            appRoutes: {
                "!admin/categories(/)": "categoriesPageRoute"
            },

            /**
             *  When the route route is hit, we want to show the correct view.
             */
            categoriesPageRoute: function() {
                if (!App.IdentityAccessManagement.Controller.sessionExists()) {
                    return Backbone.history.navigate("/!admin", {
                        trigger: true,
                        replace: true
                    });
                }

                var collection = new Module.Models.CategoryCollection();
                collection.fetch().then(function () {
                    App.appWrap.getRegion("app").show(new Module.View({collection: collection}));
                });
            }

        });

    });

});