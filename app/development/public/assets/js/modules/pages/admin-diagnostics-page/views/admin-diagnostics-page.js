/**
 *  Admin Diagnostics Page
 *
 * @module pages/admin-diagnostics-page
 * @memberof Pages
 * @see Pages
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var Footer = require("modules/common/views/footer/footer");
    var DiagnosticsController = require("../controllers/diagnostics-controller");
    var Navigation = require("modules/common/views/navigation/navigation");
    var Model = require("../models/diagnostics-model");
    var Rickshaw = require("rickshaw");

    var Template = require("text!./admin-diagnostics-page.html");

    /** Define module **/
    App.module("AdminDiagnosticsPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

            modelEvents: {
                "sync": "render"
            },

            /**
             *  Subviews
             */
            subViews: {
                footer: App.Common.Footer.View,
                navigation: App.Common.Navigation.View
            },

            /**
             *  Containers for the sub views
             */
            subViewContainers: {
                footer: "#footer-container",
                navigation: "#navigation-container"
            },

            /**
             *  Listen to the events propagated from the subviews
             */
            subViewEvents: {
                "navigation render": "onXNavigationRender"
            },

            /**
             *  Set active state on navigation once it has rendered.
             */
            onXNavigationRender: function() {
                this.navigation.setNavigationItemAsActive("admin-diagnostics");
            },

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            /**
             * Template helpers
             */
            templateHelpers: function() {
                return {
                    /** Setup helper function to add class to the element **/
                    getStatusClass: function(status) {
                        /**
                         * Switch or if statements??
                         */
                        switch(status) {
                            case "running": {
                                return "success";
                                break;
                            }
                            case "in trouble": {
                                return "warning";
                                break;
                            }
                            case "down": {
                                return "danger";
                                break;
                            }
                            case "default": {
                                return "success";
                                break;
                            }
                        }
                    }
                };
            },

            /**
             *
             * @param mappingId
             * @param histogramArray
             * @private
             */
            __drawGraph: function(mappingId, histogramArray){
                var $mappingIdEl = this.$el.find("#histogram-" + mappingId);

                if ($mappingIdEl){
                    var graph = new Rickshaw.Graph( {
                        renderer: "bar",
                        width: 400,
                        height: 85,
                        element: $mappingIdEl[0],
                        series: [
                            {
                                color: "steelblue",
                                data: histogramArray
                            }
                        ]
                    } );

                    graph.render();
                }
            },

            /**
             * When the DOM is finished painting, we will hide the loader.
             */
            onRender: function(){
                var that = this;
                this.model.get("centralMeasures").histograms.forEach(function(aCentralMeasureArray){
                    var mappingId = aCentralMeasureArray.mappingId;
                    that.__drawGraph(mappingId, aCentralMeasureArray.histogram);
                });

                App.hidePageLoader();
            },

            /**
             * Initialization
             */
            initialize: function () {
                var that = this;

                this.model = new Module.DiagnosticsModel();

                this.diagnosticsController = new Module.DiagnosticsController({
                    model: that.model,
                    serverUrl: "http://adrian.vokke.com:8019/admin/diagnostics",
                    view: that
                });

                /**
                 * We want to only listen to what the controller says, we're not implementing any of its functionality
                 * on the view.
                 */
                this.diagnosticsController.registerPolling();
            }

        });

    });

});