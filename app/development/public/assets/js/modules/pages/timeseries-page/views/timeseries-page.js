/**
 *  Timeseries page
 *
 * @module pages/timeseries-page
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
    var TimeseriesModel = require("../models/timeseries");
    var ConfigurationStore = require("modules/common/controllers/configuration-store");
    var Footer = require("modules/common/views/footer/footer");
    var Navigation = require("modules/common/views/navigation/navigation");
    var VisJSGraph = require("modules/common/controllers/visjs-graph");

    /** HTML template **/
    var Template = require("text!./timeseries-page.html");

    /** Define module **/
    App.module("TimeseriesPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

            /**
             *  Subviews
             *
             * @protected
             */
            subViews: {
                footer: App.Common.Footer.View,
                navigation: App.Common.Navigation.View
            },

            /**
             *  Containers for the sub views
             *
             * @protected
             */
            subViewContainers: {
                footer: "#footer-container",
                navigation: "#navigation-container"
            },

            /**
             * Draw the rickshaw graph
             *
             * @param timeSeries
             * @private
             */
            __drawGraph: function(timeSeries){
                var graphEl = this.$el.find("#graph")[0];
                var that = this;

                var graph = new Rickshaw.Graph( {
                    element: graphEl,
                    renderer: 'line',
                    series: [
                        {
                            color: that.graph.getColourScheme("primary", "foreground"),
                            data: timeSeries
                        }
                    ]
                } );

                graph.render();
            },

            /**
             *  Used for debugging, for seeing the time series data.
             *
             * @private
             */
            __renderStatics: function(){
                this.$el.find("#name-span").text(this.model.get("name"));
                this.$el.find("#description-span").text(this.model.get("description"));

                if (null === this.model.get("source")){
                    this.$el.find("#source-span").text("No source specified");
                }else{
                    this.$el.find("#source-span").text(this.model.get("source").name +
                        " (" + this.model.get("source").approvalStatus + ")");
                }

                if (null === this.model.get("category")){
                    this.$el.find("#category-span").text("No category specified");
                }else{
                    this.$el.find("#category-span").text(this.model.get("category").name +
                        " (" + this.model.get("category").approvalStatus + ")");
                }

                if (null === this.model.get("contributor")){
                    this.$el.find("#contributor-span").text("No contributor specified");
                }else{
                    var wantsText = this.model.get("contributor").wantsAggregationEmail ?
                        "does want aggregation email" : "does not want aggregation email";

                    this.$el.find("#contributor-span").text(this.model.get("contributor").name +
                        ", " + this.model.get("contributor").emailAddress + ", " + wantsText);
                }

                if (null === this.model.get("samplingInformation")){
                    this.$el.find("#sampling-information-span").text("No sampling-information specified");
                }else{
                    this.$el.find("#sampling-information-span").text(this.model.get("samplingInformation").samplingRate +
                        " " + this.model.get("samplingInformation").samplingUnit);
                }

                var tagText = [];
                this.model.get("tags").forEach(function(aTag){
                    tagText.push((aTag.name + " (" + aTag.approvalStatus + ")"));
                });
                this.$el.find("#tags-span").text(tagText.join(", "));
            },

            /**
             *  Called on render.
             *
             *  @protected
             */
            onRender: function() {
                App.showPageLoader();
                var that = this;

                var deferred = this.model.fetch();

                /** Load a model from the server and render it on the front to test **/
                deferred.done(function(){
                    var dataSource = [];
                    that.model.get("dataPoints").forEach(function(aValue, aIndex){
                        dataSource.push({x: aIndex, y: parseFloat(aValue)});
                    });

                    var supportMessage = "This time series has been contributed! It consists of " +
                        that.model.get("dataPoints").length + " data points.";
                    that.$el.find("#support-message").html(supportMessage);

                    that.__renderStatics();
                    App.hidePageLoader();

                    that.initializeControllers();
                    that.__drawGraph(dataSource);
                });
            },

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             * @protected
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            /**
             *  Initialize the application
             *
             * @param options
             * @protected
             */
            initialize: function(options){
                this.model = new Module.Models.Timeseries();
                this.model.set("id", options.timeseriesId);
            },

            /**
             * Move this method outside of the XHR success.
             *
             * This is going to be handled differently, as it can hog the CPU for a long time if you're not
             * careful.
             */
            initializeControllers: function() {
                var that = this;
                var container = this.$el.find("#data-visualization")[0];

                this.graph = new App.Controllers.VisJSGraph.Graph({
                    view: that,
                    model: that.model
                });

                this.graph.startGraph(container);
            }

        });

    });

});