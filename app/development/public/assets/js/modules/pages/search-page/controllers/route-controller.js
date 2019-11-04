define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var SearchPage = require("../views/search-page");
    var TimeseriesResultsPage = require("modules/pages/browse/timeseries-results-page/views/timeseries-results-page");
    var TimeseriesCollection = require("modules/pages/browse/timeseries-results-page/models/timeseries-collection");
    var SearchEvent = require("modules/common/event-tracking/search");

    /** Module definition **/
    App.module("SearchPage", function(Module, Application, Backbone) {

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             *  Setup routes for this module
             */
            appRoutes: {
                "!search(/)": "searchPageRoute",
                "!search/:query(/:page)(/)": "searchPageRoute"
            },

            /**
             * When a user hits #search/ we will show the search page.
             */
            searchPageRoute: function(query, page) {
                var options = {};

                if (undefined === page || null === page || page.match(/\D/)) {
                    page = 1;
                }

                if (null !== query) {
                    var searchEvent = new App.Common.EventTracking.Search({
                        eventLabel: query
                    });
                    searchEvent.send();
                    // App.trackEvent("search", {
                    //     query: query
                    // });

                    options.query = query;//.substr(2);
                    options.resultsList = new App.Browse.TimeseriesResultsPage.Models.TimeseriesCollection();
                    options.resultsList.fetch({data: JSON.stringify({term: options.query, page: page})}).then(function () {
                        App.appWrap.getRegion("app").show(new App.Browse.TimeseriesResultsPage.View(options));
                    });
                } else {
                    App.appWrap.getRegion("app").show(new Module.View(options));
                }
            }

        });

    });

});
