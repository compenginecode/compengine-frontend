define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var IdentityAccessManager = require("modules/common/controllers/identity-access-management");
    var PageView = require("../views/admin-tags-page");
    var TagCollection = require("../models/tag-collection");

    /** Module definition **/
    App.module("AdminTagsPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             *  Setup routes for this module
             */
            appRoutes: {
                "!admin/tags(/)": "tagsPageRoute"
            },

            /**
             *  When the route route is hit, we want to show the correct view.
             */
            tagsPageRoute: function() {
                if (!App.IdentityAccessManagement.Controller.sessionExists()) {
                    return Backbone.history.navigate("/!admin", {
                        trigger: true,
                        replace: true
                    });
                }

                var collection = new Module.Models.TagCollection();
                collection.fetchPage(1).then(function () {
                    App.appWrap.getRegion("app").show(new Module.View({collection: collection}));
                });
            }

        });

    });

});