/**
 *  Browse Page
 *
 * @module pages/browse-page
 * @memberof Pages
 * @see Pages
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette")

    /** Local dependencies **/
    var Rickshaw = require("rickshaw");
    var ColourScheme = "#009fc6";

    /** HTML template **/
    var Template = require("text!./timeseries-card.html");

    /** Define module **/
    App.module("Browse.TimeseriesResultsPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.TimeseriesCard = Backbone.Marionette.ItemView.extend({

            events: {
                'click [data-role=short-description-read-more]': 'onReadMoreButtonClick',
                'click [data-role="show-download-options"]': 'OnShowDownloadOptionsButtonClick',
                'click [data-role=download-file]': 'onDownloadFileButtonClick'
            },

            onDownloadFileButtonClick: function(ev){
                var data = {
                    ids: [$(ev.currentTarget).attr('data-id')],
                    mode: 'all',
                    type: this.$el.find('#export-type').val()
                };

                $.ajax({
                    type: "POST",
                    url: App.apiEndpoint() + "/time-series/export/search-results",
                    data: data,
                    success: function(rawJSON){
                        var token = JSON.parse(rawJSON).token;
                        window.open(App.apiEndpoint() + "/time-series/export/search-results?token=" + token);
                    }
                });
            },

            onReadMoreButtonClick: function(){
                this.$el.find('[data-role=short-description]').hide();
                this.$el.find('[data-role=long-description]').show();
            },

            OnShowDownloadOptionsButtonClick: function(){
                this.$el.find('.download-holder').show();
            },

            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            onRender: function () {
                var that = this;

                var el = that.$el.find(".time-series-thumbnail")[0];
                var thumbnail = that.createHighchartsGraph(that.model.get("timeSeries").raw, ColourScheme);
                that.$el.find(".time-series-thumbnail").append(thumbnail);

                setTimeout(function () {
                    that.Chart.reflow();
                }, 16);
            },

            _startZoomedIn: function () {
                this.Chart.xAxis[0].setExtremes(0, 40);
                if (! this.Chart.resetZoomButton) {
                    this.Chart.showResetZoom();
                }    
            },

            createHighchartsGraph: function (timeSeries, colourScheme) {

                /**
                 *  Create temporary element for the rickshaw to append to.
                 */
                var el = document.createElement("div");
                el.width = this.$el.find(".time-series-thumbnail").width();
                console.log(el.width);

                this.Chart = Highcharts.stockChart(el, {
                    
                    chart: {
                        height: 150,
                        zoomType: 'x'
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
                    }

                });

                return el;

            },
            
            /**
             * Create the rickshaw graph and return the scaled path.
             *
             * @param timeSeries {Array} Array of points for the time series
             * @param colourScheme {String} The returned HEX value from getColourScheme
             * @returns {HTMLElement} Returns the <path> element of the rickshaw graph.
             */
            createRickshawGraph: function(timeSeries, colourScheme) {
                var dataSource = [];
                var count = 0;

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
                 *  Create temporary element for the rickshaw to append to.
                 */
                var el = document.createElement("div");

                /**
                 * Instantiate a new RickShaw Graph
                 */
                var graph = new Rickshaw.Graph({
                    element: el,
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

                /** Return the scaled path from the SVG **/
                var $el = $(graph.vis[0]["0"].innerHTML);
                $el[0].setAttribute("style", "transform: scale(0.3) translateX(0) !important;");
                return $el[0].outerHTML;
            }

        });

    });

});
