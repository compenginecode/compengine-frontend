define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var CategoryCollection = require("../models/category-collection");
    var View = require("../views/browse-category-page");
    var TimeseriesResultsPage = require("modules/pages/browse/timeseries-results-page/views/timeseries-results-page");
    var TimeseriesCollection = require("modules/pages/browse/timeseries-results-page/models/timeseries-collection");

    /** Module definition **/
    App.module("Browse.BrowseCategoryPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             * Setup routes for this module
             */
            appRoutes: {},

            registerRegexRoutes: function () {
                App.router._addAppRoute(this, /!browse\/category(?:\/(.*))?(?:\/)?/, "browseCategoryRoute");
                App.router._addAppRoute(this, /!browse\/category(?:\/(.*?))(?:(?:\/)(\d+))(?:\/)?$/, "browseCategoryRoute");
            },

            /**
             * When the user hits /category & /category/:category, we'll show the category view.
             *
             * @param category {String} The category (Optional, only sent when there is a category)
             * @param page {Integer} The page for pagination (Optional, will default to page 1)
             */
            browseCategoryRoute: function(category, page) {
                var options = {};

                if (undefined === page || null === page || page.match(/\D/)) {
                    page = 1;
                }

                if (category) {
                    category = category.split("/").filter(Boolean).join("/");
                    options.resultsList = new App.Browse.TimeseriesResultsPage.Models.TimeseriesCollection();
                    App.showPageLoader();
                    options.resultsList.fetch({data: JSON.stringify({category: category, page: page})}).then(function () {
                        App.appWrap.getRegion("app").show(new App.Browse.TimeseriesResultsPage.View(options));
                    });
                } else {
                    options.resultsList = new Module.Models.CategoryCollection();
                    App.showPageLoader();
                    options.resultsList.fetch().then(function () {
                        App.appWrap.getRegion("app").show(new Module.View(options));
                    });
                }
            }

        });

    });

});