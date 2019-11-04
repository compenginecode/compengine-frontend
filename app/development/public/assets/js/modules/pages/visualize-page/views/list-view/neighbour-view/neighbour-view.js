/**
 *  List View page
 *
 * @module modules/pages/visualize-page
 * @memberof Pages
 * @see Pages
 */
define(function(require) {

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");
    var Radio = require("backbone.radio");

    /** HTML template **/
    var Template = require("text!./neighbour-view.html");

    /** Define module **/
    App.module("VisualizePage.ListView", function (Module, Application, Backbone) {

        /** Define module view **/
        Module.NeighbourView = Marionette.ItemView.extend({

            tagName: "tr",

            /**
             * Set a tabindex on the table row so the user can tab through these.
             */
            attributes: {
                "tabindex": "0"
            },

            windowWidth: 0,

            initialize: function(options) {
                this.model = options.model;
                Radio.channel("childView:neighbourView").trigger("childView:initialize", this);
                this.windowWidth = window.innerWidth;

                var that = this;

                window.addEventListener("resize", function() {
                    that.windowWidth = window.innerWidth;

                    that.watchTimeSeries();
                });
            },

            setCategoryController: function(categoryController) {
                this.categoryController = categoryController;
            },

            /**
             * Set the ID on render & Add time series preview
             */
            onRender: function() {
                this.el.setAttribute("id", this.model.get("id"));
                this.setupTimeSeriesPreview();

                this.watchTimeSeries();
            },

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel
             * @param serializedModel
             * @returns {Function}
             * @protected
             */
            template: function(serializedModel) {
                return _.template(Template, serializedModel);
            },

            /**
             * Setup the time series preview (Get the timeSeries data, colour scheme and then hand it off to Rickshaw
             * to generate the time series)
             */
            setupTimeSeriesPreview: function() {
                var that = this;
                var timeSeries = this.model.get("fullDataPoints");
                var category = this.model.get("category");
                var colourScheme = that.categoryController.getHexValueFromPosition(category);
                var container = this.$el.find("[data-role='timeSeriesPreview']");

                /** Hand it off to rickshaw to generate a graph **/
                // this.createRickshawGraph(timeSeries, colourScheme, container[0]);

                // var el = that.$el.find(".time-series-thumbnail")[0];
                var thumbnail = that.createHighchartsGraph(timeSeries, colourScheme);
                container.append(thumbnail);

                setTimeout(function () {
                    that.Chart.reflow();
                }, 100);
            },

            watchTimeSeries: function() {
                this.Chart.reflow();

                // var container = this.$el.find("[data-role='timeSeriesPreview']");

                // /** Just reduce the size of the SVG a bit so it doesn't look overwhelmingly big **/
                // if(this.windowWidth <= 1200 && this.windowWidth >= 1024) {
                //     container.find("svg")[0].removeAttribute("style");

                //     container.find("svg").css("transform", "scaleY(0.1) scaleX(0.65)")
                //         .css("transform-origin", "left")
                //         .css("margin-left", "-150px")
                //         .css("margin-top", "-220px")
                //         .attr("height", "500")
                //         .parent()
                //         .css("height", "65px");
                // } else if (this.windowWidth > 1200) {
                //     container.find("svg")[0].removeAttribute("style");

                //     container.find("svg").css("transform", "scaleY(0.2) scaleX(0.65)")
                //         .css("transform-origin", "left")
                //         .css("margin-top", "-200px")
                //         .attr("height", "500")
                //         .parent()
                //         .css("height", "100px")
                // }
            },

            /**
             * Create the rickshaw graph and return the scaled path.
             *
             * @param timeSeries {Array} Array of points for the time series
             * @param colourScheme {String} The returned HEX value from getColourScheme
             * @param container {HTMLElement} The container element for Rickshaw to render to.
             */
            createRickshawGraph: function(timeSeries, colourScheme, container) {
                var dataSource = [];

                timeSeries.forEach(function(aValue, aIndex){

                    /**
                     * Setup datasource for rickshaw graph.
                     */
                    dataSource.push({
                        x: aIndex,
                        y: parseFloat(aValue)
                    });

                });

                /**
                 * Instantiate a new RickShaw Graph
                 */
                var graph = new Rickshaw.Graph({
                    element: container,
                    renderer: 'line',
                    series: [
                        {
                            color: colourScheme,
                            data: dataSource
                        }
                    ]
                });

                /** Create the SVG element **/
                graph.render();
            },

            createHighchartsGraph: function (timeSeries, colourScheme) {
                
                /**
                 *  Create temporary element for the rickshaw to append to.
                 */
                var el = document.createElement("div");
                el.width = this.$el.find(".time-series-thumbnail").width();
    
                this.Chart = Highcharts.stockChart(el, {
                    
                    chart: {
                        height: 150,
                        zoomType: 'x',
                        resetZoomButton: {
                            position: {
                                // align: 'right',
                                // verticalAlign: 'top',
                                x: -5,
                                y: 5
                            },
                            // relativeTo: 'plot',
                            // theme: {
                                // zIndex: 20
                            // }
                        }
                    },
    
                    colors: [colourScheme],
    
                    rangeSelector: { enabled: false, selected: 1 },
    
                    navigator: { enabled: false },
    
                    scrollbar: { enabled: false },
    
                    series: [{
                        name: name || "",
                        data: timeSeries,
                        tooltip: {
                            valueDecimals: 5
                        }
                    }],
    
                    plotOptions: {
                        series: {
                            animation: false
                        }
                    },
    
                    xAxis: {
                        labels: {
                            enabled: false
                        }
                    },
    
                    tooltip: {
                        enabled: false
                        // headerFormat: " ",
                        // formatter: function() {
                        //     var _name = name;
    
                        //     if (name === undefined) {
                        //         _name = "Timeseries";
                        //     }
    
                        //     // var s = _name + ": ";
                        //     var s = "";
    
                        //     $.each(this.points, function () {
                        //         s += this.y;
                        //     });
    
                        //     return s;
                        // }
                    }
    
                });
    
                return el;
    
            }

        });

    });

});