/**
 *  Vis.JS Graph module
 *
 * @module common/controllers/visjs-graph
 * @memberof Controllers
 * @see Controllers
 */
define(function(require) {

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var Rickshaw = require("rickshaw");
    var VisJS = require("vis");

    /** Define module **/
    App.module("Controllers.VisJSGraph", function(Module, Application, Backbone){

        /** Define graph object **/
        Module.Graph = Marionette.Object.extend({

            update: false,

            /**
             *  Initialization
             *
             * @param options
             */
            initialize: function(options) {
                this.options = options;
                this.context = options.view;

                this.showAnnotations = true;

                this.categoryController = options.categoryController;

                this._setupEventListeners();
            },

            _setupEventListeners: function () {
                var that = this;
                this.on('center', function () {
                    that.network.fit();
                });

                let zoomFactor = 0.2;
                let maxZoom = 10;
                let minZoom = 0.2;

                this.on('zoomIn', function () {
                    let nextScale = that.network.getScale() + zoomFactor;
                    nextScale = nextScale < maxZoom ? nextScale : maxZoom;
                    that.network.moveTo({
                        scale: that.network.getScale() + zoomFactor
                    });
                });

                this.on('zoomOut', function () {
                    let nextScale = that.network.getScale() - zoomFactor;
                    nextScale = nextScale > minZoom ? nextScale : minZoom;
                    that.network.moveTo({
                        scale: nextScale
                    });
                });
            },

            clearEdges: function(){
                var that = this;
                /** For the clear animation **/
                this.edges.clear();

                /** We do a bit of black magic functional programming to extract the ID of all the time series
                 *  in the node dataset. **/
                var existingNodeIds = _.map(_.filter(_.pairs(this.nodes.getDataSet()._data),_.last),_.first);
                var i = 0;
                existingNodeIds.forEach(function(aNodeId){
                    if ("root" !== aNodeId){
                        var node = that.nodes.getDataSet()._data[aNodeId];

                        setTimeout(function(){
                            that.nodes.remove(node);
                        }, i * 100);
                    }
                    i++;
                });
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

                if (undefined === timeSeries) {
                    return;
                }

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

                // debugger;

                graph.renderer.setStrokeWidth(10);

                /** Create the SVG element **/
                graph.render();

                /** Return the scaled path from the SVG **/
                var $el = $(graph.vis[0]["0"]);
                $el.find("path").attr("style", "transform: scale(0.15) translateX(0) !important;");
                $el.attr("version", 1.1).attr("xmlns", "http://www.w3.org/2000/svg");

                var _el = $el[0].parentNode.innerHTML;
                var src = 'data:image/svg+xml;base64,'+ btoa(_el);
                var img = new Image();
                img.src = src;

                return img;
            },

            /**
             *
             * @param annotationCode {HTMLElement} The rickshaw annotation grpa
             * @param hexColor {String} The type of color we want rendered in Base 10 (Primary - Denary)
             * @param neighbourType {String} The neighbour's type (First tier or Second tier)
             * @returns {string}
             */
            getCircleSVG: function(annotationCode, hexColor, neighbourType){
                var size = 120;
                if ("first-tier" === neighbourType){
                    return "<svg xmlns='http://www.w3.org/2000/svg' width='" + (size * 26 / 12) + "' height='" + size + "'>" + annotationCode +
                        "<circle cx='" + size * 13 / 12 + "' cy='" + size * 6 / 12 + "' r='" + size * 5 / 12 + "' fill='" + hexColor + "'></circle></svg>";
                }else{
                    return "<svg xmlns='http://www.w3.org/2000/svg' width='" + (size * 26 / 12) + "' height='" + size + "'>" + annotationCode +
                        "<circle cx='" + size * 13 / 12 + "' cy='" + size * 6 / 12 + "' r='" + size * 5 / 12 + "' fill='#f4f4f4' stroke='" + hexColor +
                        "' stroke-width='4' >" + "</circle>" +
                        "<circle cx='" + size * 13 / 12 + "' cy='" + size * 6 / 12 + "' r='" + size * 5 / 12 + "' fill='#f4f4f4' stroke='" + hexColor +
                        "' stroke-width='3'></circle>" +
                        "</svg>";
                }
            },

            /**
             * Creates a square SVG and returns it as a string.
             *
             * @param annotationCode {} ???
             * @param hexColor {String} The type of color we want rendered in Base 10 (Primary - Denary)
             * @param neighbourType {String} The neighbour's type (First tier or Second tier)
             * @returns {string} The SVG Element
             */
            getSquareSVG: function(annotationCode, hexColor, neighbourType){
                if ("first-tier" === neighbourType){
                    return "<svg xmlns='http://www.w3.org/2000/svg' width='260' height='120'>" + annotationCode +
                        "<rect width='100' height='100' x='75' y='25' fill='" + hexColor + "'></rect></svg>";
                }else{
                    return "<svg xmlns='http://www.w3.org/2000/svg' width='260' height='150'>" + annotationCode +
                        "<rect width='60' height='60' x='75' y='25' fill='#f4f4f4' stroke='" + hexColor +
                        "' stroke-width='4' >" + "</rect>" +

                        "<rect width='20' height='20' x='95' y='45' fill='#F4F4F4' stroke='" + hexColor +
                        "' stroke-width='4' >" + "</rect></svg>";
                }
            },

            /**
             *  Create an SVG Object and then return a usable data url for the SVG Object.
             *
             * @param category {String} The category of the node.
             * @param type {String} The type of node you're rendering (You can have a primary, which has a one to many
             *                      relationship or you can have a secondary which has a one to one relationship.)
             * @param hexColor {String} The hex color string
             * @param timeSeries {Array} The time series data
             * @returns {Blob} Returns a blob URL for the new SVG Element that was rendered
             */
            createSVGObject: function(category, type, hexColor, timeSeries, showAnnotation, neighbourType) {
                var that = this;
                var innerCircle = [];
                var newSVG = "";
                var graph;

                if (showAnnotation) {
                    graph = that.createRickshawGraph(timeSeries, hexColor);
                } else {
                    graph = "";
                }

                /** All inner elements have the foreground as the stroke **/
                innerCircle.push(hexColor);

                if("real" === category.toLowerCase()) {
                    newSVG = this.getCircleSVG(graph, hexColor, neighbourType);
                } else {
                    newSVG = this.getSquareSVG(graph, hexColor, neighbourType);
                }

                var DOMURL = window.URL || window.webkitURL || window;
                var svg = new Blob([newSVG], {type: "image/svg+xml;charset=utf-8"});

                /** Return a Blob URL for the Vis graph to use. **/
                return DOMURL.createObjectURL(svg);
            },

            /**
             *  Set up the vis.js graph
             *
             * @param container {HTMLElement} The container element for VisJS
             * @public
             */
            startGraph: function(container) {
                var that = this;
                this.nodes = new VisJS.DataSet([]);
                this.edges = new VisJS.DataSet([]);

                this.nodes.add({
                    id: "root",
                    similarityScore: 584.29444631966,
                    value: 300,
                    fullDataPoints: this.context.model.get('timeSeries').downSampled
                });

                /** VisJS Options **/
                this.visJSOptions = {
                    autoResize: true,
                    nodes: {
                        borderWidth: 0,
                        size: 300,
                        scaling: {
                            label: {
                                min: 20,
                                max: 30
                            }
                        }
                    },

                    edges: {
                        color: "#b0b0b0",
                        width: 1,
                        smooth: {
                            type: "dynamic"
                        }
                    },

                    interaction: {
                        hover: true
                    },

                    physics: {
                        maxVelocity: 2,
                        minVelocity: 0.5,
                        timestep: 2,
                        stabilization: {
                            enabled: false
                        },
                        solver: "barnesHut"
                    },

                    width: "100%",
                    height: "100vh"
                };

                /**
                 * This can take from 500ms to 1.5s!!!
                 * (This should be handled in a WebWorker that sends back something like a blob to render)
                 *
                 * Beware of this plugin, it has been the issue of our "sluggish" performance on all pages with the
                 * graphs.
                 */
                this.network = new VisJS.Network(container, {
                    nodes: that.nodes,
                    edges: that.edges
                }, this.visJSOptions);

                /**
                 * Pass out the nodes for the sidebar
                 */
                this.options.view.trigger("nodesRendered", that.nodes);

                this.network.on("afterDrawing", function() {
                    that.options.view.trigger("graphRendered");
                });

                this.network.on("selectNode", function(options) {
                    that.options.view.trigger("selectedNode", options.nodes[0]);
                });

                this.network.on("hoverNode", function(options) {
                    that.options.view.trigger("hoverNode", options.node);
                });

                this.network.on("blurNode", function(options) {
                    that.options.view.trigger("blurNode");
                });

                this.network.on("doubleClick", function(e) {
                    that.trigger("network:doubleClick", e);
                });
            },

            setPhysics: function(value) {
                var currentOptions = this.visJSOptions;

                currentOptions.physics.enabled = value;

                this.network.setOptions(currentOptions);
            },

            toggleAnnotations: function(toggle){
                this.showAnnotations = toggle;
            },

            /**
             * Simply update the data instead of the graph directly.
             */
            updateNodes: function(neighbours, animate, root) {
                /**
                 *  1) For each node, get its category
                 *  2) Create a (category: count) object
                 *  3) Pass the position into category-controller and out pops the color
                 */

                this.update = true;

                var smoothType;
                var that = this;

                if (neighbours.nodes.length > 60) {
                    smoothType = "continuous";
                } else {
                    smoothType = "dynamic";
                }

                this.network.setOptions({
                    edges: {
                        smooth: {
                            type: smoothType
                        }
                    }
                });

                if (undefined === animate) {
                    animate = true;
                }

                var tags = "N/A";
                if (root.tags){
                    var tagNames = [];
                    root.tags.forEach(function(aTag){
                        tagNames.push(aTag.name);
                    });

                    tags = tagNames.join(", ");
                }

                this.nodes.update({
                    id: "root",
                    similarityScore: 0,
                    value: 300,
                    fullDataPoints: this.context.model.get('timeSeries').downSampled,
                    image: "/assets/img/bullseye.svg",
                    shape: "image"
                });

                /** For the clear animation **/
                this.edges.clear();

                neighbours.edges.forEach(function(anEdge){
                    anEdge.length = Math.min(Math.max(anEdge.length, 200), 2000);
                    that.edges.update(anEdge);
                });

                /** We do a bit of black magic functional programming to extract the ID of all the time series
                 *  in the node dataset. **/
                var existingNodeIds = _.map(_.filter(_.pairs(this.nodes.getDataSet()._data),_.last),_.first);

                /** Get the IDs of all the time series we do need to display **/
                var neighbourNodeIds = _.map(neighbours.nodes, function(e){ return e.id;});

                var toAdd = _.difference(neighbourNodeIds, existingNodeIds);
                var i = 0;

                toAdd.forEach(function(aNodeId){
                    neighbours.nodes.forEach(function(aNode){
                        if (aNode.id === aNodeId) {
                            var node = that.nodes.get(aNode.id);
                            var rootNode = that.network.getPositions("root");
                            aNode.mass = Math.min(2, Math.max(4, aNode.similarityScore));

                            aNode.x = rootNode["root"].x;
                            aNode.y = rootNode["root"].y;

                            if (!node){
                                that.nodes.add(aNode);
                            }
                        }
                    });
                    i++;
                });

                var toRemove = _.difference(existingNodeIds, neighbourNodeIds);
                i = 0;

                toRemove.forEach(function(aNodeId){
                    if ("root" !== aNodeId){
                        var node = that.nodes.getDataSet()._data[aNodeId];

                        setTimeout(function(){
                            that.nodes.remove(node);
                        }, animate ? i * 100 : 0);
                    }
                    i++;
                });

                /** We have to re-render the annotations forcefully. We need to do this because the annotation settings
                 *  may have changed on existing nodes, which are bypassed for efficiency by the above code. **/
                that.nodes.forEach(function(aNode){

                    /** Because we do not completely redraw the graph, and we're simply "diffing" it there's a
                     *  change that between a diff, even though a given node should remain, it's type may
                     *  change from a first-tier to second-tier or vice versa. Because of this, we must check
                     *  each node at the end and update it's type if necessary. **/
                    var type = aNode.type;
                    neighbours.nodes.forEach(function(aNeighbourNode){
                        if (aNode.id === aNeighbourNode.id){
                            // console.log("Updating type from " + type + " to " + aNeighbourNode.type);
                            type = aNeighbourNode.type;
                        }
                    });

                    /** Explicitly ignore the root and all others that may lack data for whatever reason **/
                    if (aNode.dataPoints){

                        that.nodes.update(aNode);
                    }
                });

                this.options.view.trigger("nodesUpdated", that.nodes);

                this.network.on("afterDrawing", function (ctx) {
                    that.nodes.forEach(function(node, id) {

                        if (!that.showAnnotations) {
                            return false;
                        }

                        // downsample annoation graphs to 100 points.
                        let points = 50;
                        let mod = Math.ceil(node.fullDataPoints.length / points);

                        var maxValue = 0;
                        var minValue = 0;
                        var timeseries = node.fullDataPoints.filter(function (_, i) {
                            return i % mod === 0;
                        });

                        timeseries.forEach((function(aVal){
                            if (aVal > maxValue){
                                maxValue = aVal;
                            }

                            if (aVal < minValue){
                                minValue = aVal;
                            }
                        }));
                        
                        /** We need a way to scale the time series. For now, we scale the positive
                         *  and negative values by their maximums. **/
                        var divisor = Math.abs(maxValue - minValue);
                        timeseries.forEach(function(part, index){
                            if (timeseries[index] < 0){
                                timeseries[index] = timeseries[index] / Math.abs(minValue);
                            }
                            if (timeseries[index] > 0){
                                timeseries[index] = timeseries[index] / Math.abs(maxValue);
                            }
                        });

                        // var timeseries = node.dataPoints;
                        var colorScheme = 'root' === id ? '#97C2FC' : that.categoryController.getHexValueFromPosition(node.category);
                        var rickshaw = node.rickshaw;
                        var nodePosition = that.network.getPositions(id);

                        var x = parseInt(nodePosition[id].x - ('root' == id ? 90 : 60));
                        var y = parseInt(nodePosition[id].y - ('root' == id ? 30 : 20));

                        /** Cache the rickshaw image **/
                        if (node.rickshaw === undefined) {
                            rickshaw = that.createRickshawGraph(timeseries, colorScheme);

                            if (rickshaw !== undefined) {
                                that.nodes.update({ id: id, rickshaw: rickshaw });
                            }
                        }

                        if (rickshaw !== undefined) {
                            ctx.drawImage(rickshaw, x, y, 300, 250);
                        }

                        /** Clean up **/
                        timeseries = undefined;
                        colorScheme = undefined;
                        rickshaw = undefined;
                        nodePosition = undefined;
                    });
                });
            },

            /**
             * Janitorial duties-
             *
             * Cleanup after ourselves & ensure we don't have the event listeners in memory.
             */
            cleanup: function() {
                this.network.destroy();
            }

        });

    });

});
