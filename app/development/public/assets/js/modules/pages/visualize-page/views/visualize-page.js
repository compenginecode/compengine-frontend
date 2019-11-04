/**
 *  Visualize page
 *
 * @module modules/pages/visualize-page
 * @memberof Pages
 * @see Pages
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");
    var Radio = require("backbone.radio");

    /** Local dependencies **/
    var Bootstrap = require("bootstrap");
    var ComparisonResultModel = require("../models/comparison-result");
    var ConfigurationStore = require("modules/common/controllers/configuration-store");
    var ContributionMetadataModal = require("modules/modals/contribution-metadata-modal/modal");
    var ContributionMetadataPrompt = require("modules/prompts/contribution-metadata-prompt/prompt");
    var Footer = require("modules/common/views/footer/footer");
    var HighStock = require("highstock");
    var ListView = require("./list-view/list-view");
    var LocalForage = require("localForage");
    var Navigation = require("modules/common/views/navigation/navigation");
    var Rickshaw = require("rickshaw");
    var Sidebar = require("./sidebar/sidebar");
    var TruncationModal = require("modules/modals/truncation-modal/modal");
    var SocialView = require("modules/common/views/social-view/social-view");
    var GraphHelpModal = require("modules/modals/graph-help-modal/modal");
    var SuccessfulComparison = require("modules/common/event-tracking/successful-comparison");

    /** Controllers **/
    var CategoryController = require("modules/common/controllers/category-controller");
    var VisJSGraph = require("modules/common/controllers/visjs-graph");

    /** HTML template **/
    var Template = require("text!./visualize-page.html");
    var ErrorTemplate = require("text!./missing-timeseries.html");

    /** Define module **/
    App.module("VisualizePage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = App.Common.Views.ManagedView.View.extend({

            showAnnotations: true,

            events: {
                "change #show-annotations": "onShowAnnotationsChange",
                "click #card-tabs>a": "onCardTabsClick",
                "click [data-role='find-neighbours']": "onClickFindNeighbours",
                "click #zoom-in-graph": "_zoomInGraph",
                "click #zoom-out-graph": "_zoomOutGraph",
                "click #center-graph": "_centerGraph",
                "click #show-help-modal": "onShowHelpModal",
                'click #hide-show-information-panel': "onShowHideInformationPanel"
            },

            /**
             *  Subviews
             *
             * @protected
             */
            subViews: {
                footer: App.Common.Footer.View,
                navigation: App.Common.Navigation.View,
                sidebar: Module.Sidebar.View
            },

            /**
             *  Containers for the sub views
             *
             * @protected
             */
            subViewContainers: {
                footer: "#footer-container",
                navigation: "#navigation-container",
                listView: "#list-view",
                sidebar: "#sidebar"
            },

            subViewEvents: {
                "sidebar neighboursAmountChanged": "onSidebarNeighboursAmountChanged",
                "sidebar viewChange": "onSidebarViewChange",
                "sidebar filterChanged": "onSidebarFilterChanged",
                "sidebar export": "onExport",
                "listView change:activeNode": "onListViewDoubleClick",
                "sidebar render": "onSidebarRender"
            },

            socialTags: function () {
                return {
                    "og:title": "Visualize timeseries on CompEngine",
                    "og:image": GLOBALS.appUrl + "/assets/img/waveform.png"
                }
            },

            modelEvents: {
                "change": "onModelChange"
            },

            onShowHideInformationPanel: function(){
                this.isExpanded = !this.isExpanded;

                if (this.isExpanded){
                    this.$el.find('#analysis-panel').css('top', '100%');
                    this.$el.find('.floating-sidepanel').css('height', '100%');
                    this.$el.find('.vis-network').css('height', 'calc(100vh - 170px)');
                }else{
                    this.$el.find('#analysis-panel').css('top', '');
                    this.$el.find('.floating-sidepanel').css('height', '');
                    this.$el.find('.vis-network').css('height', '');
                }
            },

            onExport: function(mode, exportType){
                console.log('export!', mode, exportType);
                var existingNodeIds = this.currentlyViewing;

                if ("all" === mode) {
                    existingNodeIds = _.map(_.filter(_.pairs(this.graph.nodes.getDataSet()._data),_.last),_.first);
                }

                var data = {
                    ids: existingNodeIds,
                    mode: mode,
                    type: exportType
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

            renderNetworkGraph: function(){
                var that = this;
                var deferred = this.model.fetchComparisonResults(this.filterCondition);

                /** Load a model from the server and render it on the front to test **/
                deferred.done(function(returnValue){
                    var alert = that.$el.find("[role='alert']");

                    App.hidePageLoader();

                    that.initializeControllers();

                    if(that.model.get("hadPreprocessing")) {
                        that.__showTruncationModal();
                        that.truncationModalShown = true;
                    }

                    if (that.model.get("name")){
                        that.$el.find("#name").text(that.model.get("name")).fadeIn(400);
                        that.$el.find("#data-visualization").addClass("has-name");
                    } else {
                        alert.toggleClass("alert-fadeIn--show");

                        window.setTimeout(function() {
                            alert.toggleClass("alert-fadeIn--show")

                        }, 3000);
                    }

                    
                    var successfulComparisonEvent = new App.Common.EventTracking.SuccessfulComparison({
                        eventLabel: that.model.get("id")
                    });
                    successfulComparisonEvent.send();
                    // App.trackEvent("successful-comparison", {
                    //     mode: that.model.get("mode"),
                    //     id: that.model.get("id")
                    // });

                });

                deferred.fail(function(errVal) {
                    var message = errVal.responseJSON.message;
                    var regex = /Invalid timeseries ID/g;

                    if (parseInt(errVal.status) === 422 && null !== regex.exec(message)) {
                        that.$el.find("#results-page-container").html(ErrorTemplate).attr("id", "error-page-container")

                        App.hidePageLoader();
                    } else {
                        LocalForage.removeItem("visualize").then(function() {
                            App.router.navigate("!visualize", {
                                trigger: true
                            });

                            that.promptChannel = Backbone.Radio.channel("prompts");
                            that.promptChannel.trigger("closeCurrentPrompt");
                        });
                    }
                });
            },

            /**
             * Sometimes, the prompt will render before the modal.
             *
             * This will by default assume the prompt did render first, otherwise the prompt will change this to one
             * if it isnt the case.
             */
            promptViewNum: 0,

            /**
             *  Called on render.
             *
             *  @protected
             */
            onRender: function() {
                App.showPageLoader();
                this.$el.find("#node-selected").hide();
                this.$el.find("#no-node-selected").show();

                var that = this;

                App.Common.Views.ManagedView.View.prototype.onRender.call(this);

                this.renderNetworkGraph();

                if ("temporary" === this.model.get("mode")){
                    this.listenToOnce(this, "graphRendered", function() {
                        setTimeout(function(){
                            if(that.truncationModalShown) {
                                that.promptViewNum = 1;
                            }

                            that.__showContributionMetadataPrompt();
                        }, 5000);
                    });

                    /**
                     *  Wait for the contributionMetaData prompt to propagate an event that verifies that
                     *  "Yes the user did in fact click that button!"
                     *
                     *  Once that is sent, we will open up the contribution metadata modal (not prompt)
                     */
                    this.promptChannel.on("contribute__hidden:click", function() {
                        App.closeModal();
                        that.__showContributionMetadataModal();
                    });
                }

                this.listenTo(this, "selectedNode", function(selectedNode) {
                    that.selectedNode = selectedNode;
                    that.updateNodeAnalysisPanel(selectedNode, function() {
                        that.$el.find("#analysis-information")[0].removeAttribute("style");
                        that.$el.find("#analysis-loader").hide();
                    });

                    if ("root" === selectedNode) {
                        that.$el.find("[href='#node-analysis']").removeClass("active");
                        that.$el.find("[href='#target-node-analysis']").addClass("active");
                        $('#node-analysis').hide().removeClass('active');
                        $('#target-node-analysis').show().addClass('active');
                    } else {
                        that.$el.find("[href='#target-node-analysis']").removeClass("active");
                        that.$el.find("[href='#node-analysis']").addClass("active");
                        $('#target-node-analysis').hide().removeClass('active');
                        $('#node-analysis').show().addClass('active');
                    }
                });

                this.listenTo(this, "hoverNode", function(selectedNode) {
                    that.updateNodeAnalysisPanel(selectedNode, function() {
                        that.$el.find("#analysis-information")[0].removeAttribute("style");
                        that.$el.find("#analysis-loader").hide();
                    });
                });

                this.listenTo(this, "blurNode", function() {
                    if (! that.selectedNode) {
                        return;
                    }

                    that.updateNodeAnalysisPanel(that.selectedNode, function() {
                        that.$el.find("#analysis-information")[0].removeAttribute("style");
                        that.$el.find("#analysis-loader").hide();
                    });
                });

                this.$el.find("#footer-container").hide();

                this.listenToOnce(this, "graphRendered", function() {
                    let centerGraphButton = $('#center-graph');
                    centerGraphButton.tooltip({
                        html: true,
                        title: '<div style="padding:5px 3px;">Pretty, isn\'t it?<br />Zoom to view the full graph.</div>',
                        trigger: 'hover'
                    });

                    LocalForage.getItem('centerGraphButtonTooltipAcknowledged').then(function (centerGraphButtonTooltipAcknowledged) {
                        if (! centerGraphButtonTooltipAcknowledged) {
                            centerGraphButton.tooltip('show');
                            
                            centerGraphButton.on('hide.bs.tooltip', function () {
                                LocalForage.setItem('centerGraphButtonTooltipAcknowledged', true);
                            });
                        }
                    });
                });
            },

            onModelChange: function() {
                var that = this;
                var chartData = [];
                var timeSeries = this.model.get("timeSeries");
                var sfiData = this.model.get("sfi");
                var name = this.model.get("name");
                var count = 0;
                var max = 20;
                this.Chart = Highcharts.stockChart('target-node-container', {

                    chart: {
                        height: 90,
                        zoomType: 'x'
                    },

                    rangeSelector: { enabled: false },

                    navigator: { enabled: false },

                    scrollbar: { enabled: false },

                    series: [{
                        name: name || "",
                        data: timeSeries.raw,
                        tooltip: {
                            valueDecimals: 5
                        }
                    }],

                    xAxis: {
                        labels: {
                            enabled: false
                        }
                    },

                    tooltip: {
                        enabled: false
                    }
                });

                var zeroFill = function(number, width ){
                    width -= number.toString().length;
                    if ( width > 0 )
                    {
                        return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
                    }
                    return number + ""; // always return a string
                };

                var $sfiContainer = this.$el.find("#traffic-lights");
                $sfiContainer.children().remove();
                sfiData.some(function(anSFI) {
                    if(count !== max && count < max) {
                        anSFI.value = Math.floor(Math.random() * 100);

                        /** We do not want to show a zero value, so we clamp at 1 on the lower bound */
                        value = Math.max(1, (Math.round(anSFI.value * 100) / 100));
                        var topRelative = Math.max(1, Math.round((100 - value) * 100) / 100, 1);
                        var prettyValue = "Bottom " + value + "% of population";
                        if (value > 50){
                            var prettyValue = "Top " + topRelative + "% of population";
                        }

                        var classId = zeroFill(20 - Math.ceil(topRelative / 100 * 20), 2);
                        var classString = "tf-" + classId;
                        
                        var $el = $('<div class="traffic-light ' + classString + '" data-html="true" title="<label>' + anSFI.name 
                            + ' (' + anSFI.prettyName + ')' 
                            + '</label><p></p>' + prettyValue 
                            + '</p>"></div>'
                        );
                        
                        $sfiContainer.append($el);
                    }
                    count++;
                });
                this.$el.find('.traffic-light').tooltip();

                if(! this.model.get('name')) {
                    this.$el.find('[data-id="target-node-name"]').text('Recently Uploaded Time Series!');
                    this.$el.find('[data-id="target-node-category"]').text('Please contribute');
                    this.$el.find('#target-node-details').hide();
                } else {
                    this.$el.find('[data-id="target-node-name"]').text(this.model.get('name'));
                    this.$el.find('[data-id="target-node-name"]').attr('title', this.model.get('name'));
                    var categoryText = this.model.get('category') ? this.model.get('category').name : '';
                    this.$el.find('[data-id="target-node-category"]').text(categoryText);
                    this.$el.find('[data-id="target-node-category"]').attr('title', categoryText);
                    this.$el.find('[data-id="target-node-tags"]').text(this.model.get('tags') ? this.model.get('tags').map(function (tag) { return tag.name; }).join(', ') : '');
                    this.$el.find('[data-id="target-node-tags"]').attr('title', this.model.get('tags') ? this.model.get('tags').map(function (tag) { return tag.name; }).join(', ') : '');
                    
                    if ('' !== this.model.get('description') && null !== this.model.get('description')){
                        this.$el.find('[data-id="target-node-description"]').text(this.model.get('description').substr(0,50) + '...');
                        this.$el.find('[data-id="target-node-description"]').attr('title', this.model.get('description'));
                    }

                    this.$el.find('[data-id="target-node-source"]').text(this.model.get('source') ? this.model.get('source').name : '');
                    this.$el.find('[data-id="target-node-source"]').attr('title', this.model.get('source') ? this.model.get('source').name : '');
                    
                    this.$el.find('[data-id="target-node-sampling-rate"]').text(this.model.get('samplingInformation') ? this.model.get('samplingInformation').samplingRate : 'N/A');
                    this.$el.find('[data-id="target-node-sampling-rate"]').attr('title', this.model.get('samplingInformation') ? this.model.get('samplingInformation').samplingRate : 'N/A');
                    
                    this.$el.find('[data-id="target-node-unit"]').text(this.model.get('samplingInformation') ? this.model.get('samplingInformation').samplingUnit : 'N/A');
                    this.$el.find('[data-id="target-node-unit"]').attr('title', this.model.get('samplingInformation') ? this.model.get('samplingInformation').samplingUnit : 'N/A');

                    this.$el.find('[data-id="target-node-contributor"]').text(this.model.get('contributor') ? this.model.get('contributor').name : 'N/A');
                    this.$el.find('[data-id="target-node-contributor"]').attr('title', this.model.get('contributor') ? this.model.get('contributor').name : 'N/A');

                    this.$el.find('#target-node-details').show();
                }

                ['name', 'category', 'tags', 'source', 'sampling-rate', 'unit', 'contributor'].forEach(function (detail) {
                    var text = that.$el.find('[data-id="target-node-' + detail + '"]').text();
                    that.$el.find('[data-id="target-node-' + detail + '"]').parent().find('label').attr('title', text);
                });

                window.setTimeout(function() {
                    that.$el.find(".analysis-details")
                        .find(".description")
                        .find("[data-toggle='tooltip']")
                        .tooltip();
                    that.$el.find("#interesting-info-tooltip")
                        .tooltip({
                            trigger: 'manual',
                            html: true,
                            animation: false
                        }).on('mouseenter', function () {
                            var _this = this;
                            $(this).tooltip('show');
                            $('.tooltip').on('mouseleave', function () {
                                $(_this).tooltip('hide');
                            });
                        }).on('mouseleave', function () {
                            var _this = this;
                            setTimeout(function () {
                                if (!$('.tooltip:hover').length) {
                                    $(_this).tooltip('hide');
                                }
                            }, 150);
                        });
                }, 64);
            },

            /**
             * Translate newline to br tags
             *
             * @param string {string} The input string
             * @returns {string} The translated string
             */
            nlToBr: function(string) {
                return string.replace(/(?:\r\n|\r|\n)/g, '<br />');
            },

            /**
             * Updates the node analysis panel (And show's it if it isn't visible)
             *
             * @param nodeID {String} The Node's ID
             * @param callback {Function} Callback function (Optional)
             */
            updateNodeAnalysisPanel: function(nodeID, callback) {
                if(nodeID === this.currentlyViewing || "root" === nodeID) {
                    return;
                }
                var model = new Backbone.Model();
                var that = this;
                var noNode = this.$el.find("#no-node-selected");
                var node = this.$el.find("#node-selected");
                var noneSelected = noNode.is(":visible") && !node.is(":visible");
                var nodeSelectedButHidden = !noNode.is(":visible") && !node.is(":visible");

                noNode.hide();
                node.show();

                var analysisName = this.$el.find("[data-id='analysis-name']");
                var analysisCategory = this.$el.find("[data-id='analysis-category']");
                var analysisDescription = this.$el.find("[data-id='analysis-description']");
                var analysisSource = this.$el.find("[data-id='analysis-source']");
                var analysisSamplingRate = this.$el.find("[data-id='analysis-sampling-rate']");
                var analysisTags = this.$el.find("[data-id='analysis-tags']");
                var analysisUnit = this.$el.find("[data-id='analysis-unit']");
                var analysisContributor = this.$el.find("[data-id='analysis-contributor']");
                var findNeighboursButton = this.$el.find("[data-role='find-neighbours']");
                var rickshawEl = this.$el.find(".rickshaw-container").find(".rickshaw");

                var nameTooltip = analysisName;
                var categoryTooltip = analysisCategory;
                var descriptionTooltip = analysisDescription;
                var sourceTooltip = analysisSource;
                var samplingRateTooltip = analysisSamplingRate;
                var tagsTooltip = analysisTags;
                var unitTooltip = analysisUnit;
                var contributorTooltip = analysisContributor;

                model.urlRoot = function() {
                    return App.apiEndpoint() + "/timeseries/" + nodeID + "?noNeighbours=true";
                };

                var sync = model.fetch();

                sync.done(function() {
                    var samplingInformation = model.get("samplingInformation") || {};
                    var amountOfTags = model.get("tags").length;
                    var passedFirst = false;
                    var tags = "";
                    var name = model.get("name");
                    var category = model.get("category") || { name: "N/A" };
                    var categoryName = category.name;
                    var description = model.get("description");
                    var source = model.get("source") || { name: "N/A" };
                    var sourceName = source.name;
                    var samplingRate = samplingInformation.samplingRate || "N/A";
                    var unit = samplingInformation.samplingUnit || "N/A";
                    var contributor = model.get("contributor") || { name: "N/A" };
                    var contributorName = contributor.name;
                    // var rickshaw = that.createRickshawGraph(model.get("timeSeries").raw, that.categoryController.getHexValueFromPosition(categoryName));


                    var rickshaw = Highcharts.stockChart('node-analysis-container', {
                        chart: {
                            height: 90,
                            zoomType: 'x'
                        },

                        colors: [that.categoryController.getHexValueFromPosition(categoryName)],
    
                        rangeSelector: { enabled: false },
    
                        navigator: { enabled: false },
    
                        scrollbar: { enabled: false },
    
                        series: [{
                            name: name || "",
                            data: model.get("timeSeries").raw,
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

                    model.get("tags").forEach(function(aTag) {

                        if(amountOfTags > 1 && passedFirst) {
                            tags += ", " + aTag.name;
                        } else {
                            tags = aTag.name;
                        }

                        passedFirst = true;
                    });

                    findNeighboursButton.attr("id", model.get("id"));

                    // Clear tooltip
                    that.$el.find(".analysis-details")
                        .find(".description")
                        .find("[data-toggle='tooltip']")
                        .tooltip('dispose');

                    that.$el.find("#interesting-info-tooltip")
                        .tooltip('dispose');

                    analysisName.text(name);
                    analysisCategory.text(categoryName);
                    analysisDescription.text(description);
                    analysisSource.text(sourceName);

                    analysisSamplingRate.text(samplingRate);
                    analysisTags.text(tags);

                    analysisUnit.text(unit);

                    analysisContributor.text(contributorName);

                    nameTooltip.attr("title", name);
                    categoryTooltip.attr("title", categoryName);
                    descriptionTooltip.attr("title", description);
                    sourceTooltip.attr("title", sourceName);
                    samplingRateTooltip.attr("title", samplingRate);
                    tagsTooltip.attr("title", tags);
                    unitTooltip.attr("title", unit);
                    contributorTooltip.attr("title", contributorName);

                    if (callback !== undefined && typeof callback === "function") {
                        callback();
                    }

                    that.currentlyViewing = nodeID;

                    window.setTimeout(function() {
                        that.$el.find(".analysis-details")
                            .find(".description")
                            .find("[data-toggle='tooltip']")
                            .tooltip();
                        that.$el.find("#interesting-info-tooltip")
                            .tooltip({
                                trigger: 'manual',
                                html: true,
                                animation: false
                            }).on('mouseenter', function () {
                                var _this = this;
                                $(this).tooltip('show');
                                $('.tooltip').on('mouseleave', function () {
                                    $(_this).tooltip('hide');
                                });
                            }).on('mouseleave', function () {
                                var _this = this;
                                setTimeout(function () {
                                    if (!$('.tooltip:hover').length) {
                                        $(_this).tooltip('hide');
                                    }
                                }, 150);
                            });
                    }, 64);
                });

                sync.fail(function() {
                    if (callback !== undefined && typeof callback === "function") {
                        callback();
                    }
                });
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

                this.updateLegend();

                this.graph = new App.Controllers.VisJSGraph.Graph({
                    view: that,
                    categoryController: that.categoryController
                });

                this.graph.startGraph(container);

                /** Now we render the graph and legend. We don't want animations on the first load **/
                this.reRenderGraph(false);

                this.listenTo(this.graph, "network:doubleClick", this.onNetworkDoubleClick.bind(this));
            },

            /**
             * When the network is double clicked
             *
             * @param e {Object} Event object passed from VisJS
             */
            onNetworkDoubleClick: function(e) {
                if (! e.nodes[0]) {
                    return;
                }

                this.changeActiveNode(e.nodes[0]);
            },

            /**
             * When the user double clicks a row item in the list view.
             *
             * @param id {String} The id of the node clicked
             * @param callback {Function|undefined} Optional callback
             */
            onListViewDoubleClick: function(id, callback) {
                this.changeActiveNode(id, callback);
            },

            /**
             * When the user clicks the "find neighbours" button
             *
             * @param e {Event} The click event
             */
            onClickFindNeighbours: function(e) {
                this.changeActiveNode(e.currentTarget.getAttribute("id"));
            },

            /**
             * Change the currently active node
             *
             * @param nodeId {String} The ID of the node we've selected
             * @param callback {Function|undefined} Optional callback
             */
            changeActiveNode: function(nodeId, callback) {
                if (nodeId === "root") {
                    return;
                }

                this.sidebar.resetToDefault();
                this.filterLimit = 20;
                    
                this.graph.clearEdges();
                var that = this;
                var alert = that.$el.find("[role='alert']");

                var model = this.model.clone();
                model.filterCondition = this.model.filterCondition;

                model.set("id", nodeId);
                model.url = App.apiEndpoint() + "/timeseries/" + nodeId;
                var _deferred = model.fetch();

                _deferred.done(function() {
                    that.graph.nodes.clear();
                    that.graph.edges.clear();

                    that.categoryController.clearPreviousResults();
                    that.sidebar.updateLegend(that.__getCategoryCountObject(model.get("neighbours").nodes), that.categoryController);
                    that.listView.updateListView(model);
                    that.listView.render();

                    /** The filter limit controls the number of first-tier nodes, not the number of second-tier. To
                     *  start, we go through and add each first-tier node up until we hit the desired filter limit. **/
                    var nodes = [];
                    var nodeIds = [];
                    var i = 0;

                    that.model.get("neighbours").nodes.forEach(function(aNode){
                        if ("first-tier" === aNode.type && i < that.filterLimit){
                            aNode.color = that.categoryController.getHexValueFromPosition(aNode.category);
                            nodes.push(aNode);
                            nodeIds.push(aNode.id);
                            i++;
                        }
                    });

                    /** We now add only the second-tier nodes that are connected to the subset of the first-tier
                     *  nodes that we're choosing to view. **/
                    that.model.get("neighbours").nodes.forEach(function(aNode){
                        if ("second-tier" === aNode.type){
                            var id = aNode.id;

                            that.model.get("neighbours").edges.forEach(function(anEdge){
                                var isToOrFrom = (anEdge.to === id || anEdge.from === id);
                                var isPartOfArray = (-1 !== nodeIds.indexOf(anEdge.to) || -1 !== nodeIds.indexOf(anEdge.from));
                                if (isToOrFrom && isPartOfArray) {
                                    aNode.color = that.categoryController.getHexValueFromPosition(aNode.category);
                                    nodes.push(aNode);
                                }
                            });
                        }
                    });

                    var category = null;
                    if (model.get("category")){
                        category = model.get("category").name;
                    }

                    var source = null;
                    if (model.get("source")){
                        source = model.get("source").name;
                    }

                    that.graph.updateNodes({
                            timeSeries: model.get("timeSeries"),
                            edges: model.get("neighbours").edges,
                            nodes: nodes
                        },
                        false,
                        {
                            name: model.get("name") || null,
                            category: category,
                            source: source || null,
                            tags: model.get("tags") || null
                        });

                    alert.text("You're now viewing information for " + model.get("name"))
                        .removeClass("alert-warning")
                        .addClass("alert-success")
                        .toggleClass("alert-fadeIn--show");

                    that.$el.find("#name").text(model.get("name"));

                    that.model.set(model.toJSON());
                    Backbone.history.navigate("/!visualize/" + model.get("id"), {
                        trigger: false,
                        replace: true
                    });

                    that.sidebar.filtering.showExportModes();
                    that.sidebar.setId(model.get("id"));

                    that.$el.find("#no-node-selected").show();
                    that.$el.find("#node-selected").hide();
                });

                _deferred.always(function() {

                    window.setTimeout(function() {
                        alert.toggleClass("alert-fadeIn--show");

                        /**
                         * When the transition has ended, reset the element.
                         */
                        alert.one("transitionend", function() {
                            alert.addClass("alert-success")
                                .removeClass("alert-warning");
                        });


                    }, 4500);

                    if (undefined !== callback && typeof callback === "function") {
                        callback();
                    }
                });

                _deferred.fail(function() {
                    alert.text("Something went wrong, We were unable to find that specific node, Try again perhaps?")
                        .removeClass("alert-success")
                        .addClass("alert-warning")
                        .toggleClass("alert-fadeIn--show");
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
            initialize: function(options) {
                this.isExpanded = false;
                var that = this;

                this.filterCondition = {
                    source: "",
                    tags: [],
                    topLevelCategory: "any"
                };

                this.filterLimit = 20;
                this.chosenFilterLimit = 20;

                App.Common.Views.ManagedView.View.prototype.initialize.call(this, options);

                /**
                 *  Tune into prompt radio
                 *  We will be propagating events through this.
                 */
                this.promptChannel = Backbone.Radio.channel("prompts");

                this.model = new Module.Models.ComparisonResult();
                this.model.set("mode", options.mode);

                this.optionMode = options.mode;
                if ("temporary" === options.mode){
                    this.model.set("id", options.resultKey);
                } else {
                    this.model.set("id", options.timeSeriesId);
                }

                this.timeSeriesId = options.timeSeriesId;

                /** Reset all controllers **/
                this.controllers = [];

                this.categoryController = new App.Controllers.CategoryController.CategoryController();

                this.subViews.listView = function() {
                    return new Module.ListView.View({
                        categoryController: that.categoryController,
                        model: that.model
                    });
                };

                this.currentlyViewing = this.model.get("id");

            },

            onSidebarFilterChanged: function(filterCondition, onCompleteCallback){
                this.filterLimit = this.chosenFilterLimit;
                var that = this;
                var alert = that.$el.find("[role='alert']");
                var comparisonObject = Object.create(that.model.get("neighbours").nodes);

                this.filterCondition = filterCondition;

                var deferred = this.model.fetchComparisonResults(this.filterCondition);
                deferred.done(function(){
                    that.categoryController.clearPreviousResults();
                    that.reRenderGraph(true);
                    that.updateLegend();
                    onCompleteCallback();

                    if(that.model.get("neighbours").nodes.length === 0) {
                        alert.text("Your data is looking a bit lonely. Update your filter and try again!")
                            .removeClass("alert-success")
                            .addClass("alert-warning")
                            .toggleClass("alert-fadeIn--show");

                        window.setTimeout(function() {
                            alert.toggleClass("alert-fadeIn--show");

                            /**
                             * When the transition has ended, reset the element.
                             */
                            alert.one("transitionend", function() {
                                alert.addClass("alert-success")
                                    .removeClass("alert-warning");

                            });


                        }, 4500);
                    }
                });
            },

            onShowHelpModal: function () {
                var modal = new App.Modals.GraphHelp.Modal();
                
                App.showModal(modal);
            },

            /**
             * Get the amount of nodes for each category
             *
             * @param nodes {Array} Array of nodes, if undefined, defaults to existing model
             * @returns {Object}
             * @private
             */
            __getCategoryCountObject: function(nodes) {
                var nodesArray = nodes;

                if (nodes === undefined) {
                    nodesArray = this.model.get("neighbours").nodes;
                }

                /** Set a shared category count every time we update the category count. **/
                return this.categoryController.updateCategoryCount(nodesArray);
            },

            /**
             * Update the sidebar legend
             */
            updateLegend: function() {
                this.categoryController.clearPreviousResults();
                this.sidebar.updateLegend(this.__getCategoryCountObject(), this.categoryController);
                this.listView.render();
            },

            /**
             *  When the sidebar emits an event saying to update the view, we will.
             *
             * @private
             */
            onSidebarNeighboursAmountChanged: function(amount) {
                /** We have to save the initial, chosen amount regardless of whether we can directly use it **/
                this.chosenFilterLimit = amount;

                /** If the required amount exceeds the number of actual nodes we have, clamp it **/
                amount = Math.min(this.model.get("neighbours").nodes.length, amount);

                /** If there's no change (or, no potential change [see above]) then we bail out **/
                if (this.filterLimit === amount){
                    return;
                }

                this.filterLimit = amount;
                this.listView.setNeighboursAmount(amount);
                this.reRenderGraph(true);
                this.updateLegend();
            },

            /**
             *  Show the contribution metadata prompt & setup an event listener to open up the modal when requested.
             *
             * @private
             */
            __showContributionMetadataPrompt: function() {
                /**
                 *  Create new instance of ContributionMetadata prompt and then show it.
                 */
                var contributionMetadataPrompt = new App.Prompts.ContributionMetadata.Prompt();
                var that = this;


                App.showModal(contributionMetadataPrompt, null, "prompt", "fadeIn");

                /**
                 *  Wait for the contributionMetaData prompt to propagate an event that verifies that
                 *  "Yes the user did in fact click that button!"
                 *
                 *  Once that is sent, we will open up the contribution metadata modal (not prompt)
                 */
                this.promptChannel.on("contributionMetadata:getInvolvedButtonClicked", function() {
                    App.closeModal();
                    that.__showContributionMetadataModal();
                });
            },

            /**
             *  Show the contribution metadata modal.
             *
             * @private
             */
            __showContributionMetadataModal: function() {
                var that = this;
                var resultKey = this.model.get("id");

                /**
                 *  Create new instance of ContributionMetadata modal and then show it.
                 */
                var contributionMetadataModal = new App.Modals.ContributionMetadata.Modal({
                    resultKey: resultKey,
                    title: "Contribute your data"
                });

                App.showModal(contributionMetadataModal, function(success) {
                    /**
                     * If we have a success value returned, remove stored keys.
                     */
                    if(success !== undefined) {
                        LocalForage.removeItem("visualize");
                    }
                });

                contributionMetadataModal.once("cancel", function() {
                    that.__showContributionMetadataPrompt();
                });
            },

            /**
             * Show the truncation modal
             *
             * @private
             */
            __showTruncationModal: function() {
                var that = this;

                var truncationModal = new App.Modals.Truncation.Modal({
                    title: "Hold up...",
                    promptViewNumber: that.promptViewNum
                });

                App.showModal(truncationModal);
            },

            /**
             * When the "Show annotations" checkbox changes it value, we'll set the state of this.showAnnotations &
             * re render the graph
             *
             * @param e {Event} The change event.
             */
            onShowAnnotationsChange: function(e) {
                e.currentTarget.setAttribute("aria-checked", e.currentTarget.checked);

                this.graph.toggleAnnotations(e.currentTarget.checked);
                this.reRenderGraph();
            },

            /**
             * Programatically re-render the graph without running through all the
             * setup for the entire view again.
             */
            reRenderGraph: function(animate) {
                var that = this;

                if ("temporary" !== this.optionMode){
                    that.sidebar.filtering.showExportModes();
                }

                if (undefined === this.model.get("neighbours")){
                    throw new Error("Neighbours are required.");
                }

                /** The filter limit controls the number of first-tier nodes, not the number of second-tier. To
                 *  start, we go through and add each first-tier node up until we hit the desired filter limit. **/
                var nodes = [];
                var nodeIds = [];
                var similarityScores = [];
                var i = 0;

                that.__getCategoryCountObject(this.model.get("neighbours").nodes);

                this.model.get("neighbours").nodes.forEach(function(aNode){
                    similarityScores.push(aNode.similarityScore);
                    if ("first-tier" === aNode.type && i < that.filterLimit){
                        aNode.color = that.categoryController.getHexValueFromPosition(aNode.category);
                        nodes.push(aNode);
                        nodeIds.push(aNode.id);
                        i++;
                    }
                });

                that.minSimiliaryScore = Math.min.apply(null, similarityScores);
                that.maxSimiliaryScore = Math.max.apply(null, similarityScores);

                /** We now add only the second-tier nodes that are connected to the subset of the first-tier
                 *  nodes that we're choosing to view. **/
                this.model.get("neighbours").nodes.forEach(function(aNode){
                    if ("second-tier" === aNode.type){
                        var id = aNode.id;

                        that.model.get("neighbours").edges.forEach(function(anEdge){
                            var isToOrFrom = (anEdge.to === id || anEdge.from === id);
                            var isPartOfArray = (-1 !== nodeIds.indexOf(anEdge.to) || -1 !== nodeIds.indexOf(anEdge.from));
                            if (isToOrFrom && isPartOfArray) {
                                aNode.color = that.categoryController.getHexValueFromPosition(aNode.category);
                                nodes.push(aNode);
                            }
                        });
                    }
                });

                var category = null;
                if (this.model.get("category")){
                    category = this.model.get("category").name;
                }

                var source = null;
                if (this.model.get("source")){
                    source = this.model.get("source").name;
                }

                this.graph.updateNodes({
                        timeSeries: this.model.get("timeSeries"),
                        edges: this.model.get("neighbours").edges,
                        nodes: nodes
                    },
                    animate,
                    {
                        name: this.model.get("name") || null,
                        category: category,
                        source: source || null,
                        tags: this.model.get("tags") || null
                    }
                );
            },

            /**
             *  When the sidebar tells us of a view change, we will handle which views are shown & hidden.
             *
             * @param id {String} ID of the element that triggered the event (eg/ listView)
             */
            onSidebarViewChange: function(id) {
                if("listView" === id) {
                    this.$el.addClass('list-view');
                    this.graph.setPhysics(false);
                    this.$el.find("#data-visualization").hide();
                    this.$el.find("#list-view").show();
                    this.$el.find("#analysis-panel").css("transform", "translateY(100%)");
                    this.$el.find('#zoom-buttons').fadeOut();
                    this.$el.find("#footer-container").show();
                    this.listView.render();
                } else {
                    this.$el.removeClass('list-view');
                    this.$el.find("#data-visualization").show();
                    this.$el.find("#list-view").hide();
                    this.$el.find("#analysis-panel").css("transform", "translateY(0)");
                    this.$el.find('#zoom-buttons').fadeIn();
                    this.$el.find("#footer-container").hide();
                    this.graph.setPhysics(true);
                }
            },

            /**
             * When the user clicks one of the tabs, show that tab
             *
             * @param e {Event} The click event
             */
            onCardTabsClick: function(e) {
                e.preventDefault();
                var tabsContainer = this.$el.find("#card-tabs");
                var panelContainer = this.$el.find("#card-panel-container");

                tabsContainer.find(".active").removeClass("active");
                e.currentTarget.classList.add("active");

                panelContainer.find(".active").hide().removeClass("active");
                panelContainer.find(e.currentTarget.getAttribute("href")).show().addClass("active");

                if(e.currentTarget.getAttribute("href") === "#target-node-analysis") {
                    this.Chart.reflow();
                }
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
                $el[0].setAttribute("style", "transform: scaleY(0.30) translateX(0) translateY(40px) !important;");
                return $el[0].outerHTML;
            },

            /**
             * Cleanup the view
             */
            onBeforeDestroy: function() {
                if (this.graph !== undefined) {
                    this.graph.cleanup();
                }
            },

            onSidebarRender: function() {
                this.sidebar.setId(this.timeSeriesId);
            },

            _zoomInGraph: function () {
                this.graph.triggerMethod('zoomIn');
            },

            _zoomOutGraph: function () {
                this.graph.triggerMethod('zoomOut');
            },

            _centerGraph: function () {
                this.graph.triggerMethod('center');
            }

        });

    });

});