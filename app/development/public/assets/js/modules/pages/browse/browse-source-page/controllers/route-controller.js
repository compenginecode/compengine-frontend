define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var SourceCollection = require("../models/source-collection");
    var View = require("../views/browse-source-page");
    var TimeseriesResultsPage = require("modules/pages/browse/timeseries-results-page/views/timeseries-results-page");
    var TimeseriesCollection = require("modules/pages/browse/timeseries-results-page/models/timeseries-collection");

    /** Module definition **/
    App.module("Browse.BrowseSourcePage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             * Setup routes for this module
             */
            appRoutes: {
                "!browse/source(/:source)(/:page)(/)": "browseSourceRoute"
            },

            /**
             * When the user hits /category & /category/:category, we'll show the category view.
             *
             * @param source {String} The source (Optional, only sent when there is a source)
             * @param page {Integer} The page for pagination (Optional, will default to page 1)
             */
            browseSourceRoute: function(source, page) {
                var options = {};

                if (undefined === page || null === page || page.match(/\D/)) {
                    page = 1;
                }

                if (source) {
                    options.resultsList = new App.Browse.TimeseriesResultsPage.Models.TimeseriesCollection();
                    App.showPageLoader();
                    options.resultsList.fetch({data: JSON.stringify({source: source, page: page})}).then(function () {
                        App.appWrap.getRegion("app").show(new App.Browse.TimeseriesResultsPage.View(options));
                    });
                } else {
                    options.resultsList = new Module.Models.SourceCollection();
                    App.showPageLoader();
                    options.resultsList.fetch().then(function () {
                        App.appWrap.getRegion("app").show(new Module.View(options));
                    });
                }
            }

        });

    });

});