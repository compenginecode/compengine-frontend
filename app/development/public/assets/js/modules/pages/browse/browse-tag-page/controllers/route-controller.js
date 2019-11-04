define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var TagCollection = require("../models/tag-collection");
    var View = require("../views/browse-tag-page");
    var TimeseriesResultsPage = require("modules/pages/browse/timeseries-results-page/views/timeseries-results-page");
    var TimeseriesCollection = require("modules/pages/browse/timeseries-results-page/models/timeseries-collection");

    /** Module definition **/
    App.module("Browse.BrowseTagPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             * Setup routes for this module
             */
            appRoutes: {
                "!browse/tag(/:tag)(/:page)(/)": "browseTagRoute"
            },

            /**
             * When the user hits /category & /category/:category, we'll show the category view.
             *
             * @param tag {String} The tag (Optional, only sent when there is a tag)
             * @param page {Integer} The page for pagination (Optional, will default to page 1)
             */
            browseTagRoute: function(tag, page) {
                var options = {};

                if (undefined === page || null === page || page.match(/\D/)) {
                    page = 1;
                }

                if (tag) {
                    options.resultsList = new App.Browse.TimeseriesResultsPage.Models.TimeseriesCollection();
                    App.showPageLoader();
                    options.resultsList.fetch({data: JSON.stringify({tag: tag, page: page})}).then(function () {
                        App.appWrap.getRegion("app").show(new App.Browse.TimeseriesResultsPage.View(options));
                    });
                } else {
                    options.resultsList = new Module.Models.TagCollection();
                    App.showPageLoader();
                    options.resultsList.fetch().done(function () {
                        App.appWrap.getRegion("app").show(new Module.View(options));
                    });
                }
            }

        });

    });

});