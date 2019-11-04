define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var ConfigurationStore = require("modules/common/controllers/configuration-store");
    var VisualizePage = require("../views/visualize-page");
    var VisualizeNoDataPage = require("../views/nodata-page");
    var LocalForage = require("localForage");

    /** Module definition **/
    App.module("VisualizePage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             * Default timeout is 24 Hours (8.64e+10 Milliseconds)
             */
            TIMEOUT_IN_SECONDS: 8.64e+7,

            /**
             *  Setup routes for this module
             */
            appRoutes: {
                "!visualize(/:id)(/)": "visualizePageRoute"
            },

            /**
             * Setup configuration store.
             */
            initialize: function() {
                this.configStore = new App.ConfigurationStore.Controller();
            },

            /**
             *  When the route route is hit, we want to show the correct view.
             */
            visualizePageRoute: function(persistedId){
                var that = this;

                if (persistedId){
                    App.appWrap.getRegion("app").show(new Module.View({
                        timeSeriesId: persistedId,
                        mode: "persisted"
                    }));
                    return;
                }

                LocalForage.getItem("visualize").then(function(value) {
                    var userTime = new Date().getTime().toString();

                    /** If there is no token or the token has expired, Clear the token and go home. **/
                    if(value === null || value.key === null || that.checkSessionTimeout(value.timeSet, userTime)) {
                        LocalForage.removeItem("visualize").then(function() {
                            App.appWrap.getRegion("app").show(new Module.NoDataView());
                        });
                    } else {
                        App.appWrap.getRegion("app").show(new Module.View({
                            resultKey: value.key,
                            mode: "temporary"
                        }));
                    }
                });
            },

            /**
             * Return true if the session has timed out.
             *
             * @param timestamp {Number} The number you want to start from (Timestamp)
             * @param currentTime {Number} The current time of the client.
             * @returns {boolean} True/False
             */
            checkSessionTimeout: function(timestamp, currentTime) {
                return (currentTime - this.configStore.getComparisonResultTimeout()) >=  timestamp;
            }

        });

    });

});