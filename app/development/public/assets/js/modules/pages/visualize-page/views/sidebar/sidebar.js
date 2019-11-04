/**
 *  Visualize page
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

    /** Local dependencies **/
    var BootstrapSlider = require("BootstrapSlider");
    var Filtering = require("../filtering/filtering");
    var Legend = require("./legend/legend");
    var ModalView = require("modules/modals/contact-contributor-modal/modal");

    /** HTML template **/
    var Template = require("text!./sidebar.html");
    var SocialCard = require("text!./social-card.html");

    /** Define module **/
    App.module("VisualizePage.Sidebar", function (Module, Application, Backbone) {

        Module.View = Marionette.BossView.extend({

            facebookEnabled: false,

            events: {
                "change [name='viewType']": "onViewTypeSelectionChange",
                "click [data-role='title']": "onDataRoleTitleClick",
                "click #share-fb": "onShareFBClick"
            },

            subViews: {
                filtering: App.VisualizePage.Filtering.View,
                legend: Module.Legend.View
            },

            subViewContainers: {
                filtering: "#filtering-container",
                legend: "#legend-container"
            },

            subViewEvents: {
                "filtering filterChanged": "onFilteringFilterChanged",
                "filtering export": "onExport"
            },

            modelEvents: {
                "sync": "render"
            },

            initialize: function(options) {
                const that = this;
                Marionette.BossView.prototype.initialize.call(this, options);
                var Facebook = require(["facebook"], function () {
                    that.facebookEnabled = true;
                    FB.init({
                        appId: GLOBALS.FB_APP_ID,
                        autoLogAppEvents: true,
                        status: true,
                        xfbml: true,
                        version: 'v2.9'
                    });
                    that.render();
                }, function (e) {});
            },

            updateLegend: function(categoryCount, categoryController){
                var that = this;

                if(undefined === this.categoryController) {
                    this.categoryController = categoryController;
                }

                var categories = [];
                for(var category in categoryCount){
                    var position = that.categoryController.getCategoryPosition(category);
                    var categoryName;
                    var count;

                    if(position < 10) {
                        categoryName = category;
                        categories.push(category);
                        count = categoryCount[category];
                    } else {
                        categoryName = "Other";
                        count = 99;
                        categories.push("Other");
                    }

                    var hex = that.categoryController.getHexValueFromPosition(category);

                    that.legend.updateCategory(categoryName, count, hex);
                }

                that.legend.removeDifference(categories);

                that.legend.reRender();
            },

            onExport: function(mode, exportType){
                this.trigger("export", mode, exportType);
            },

            onFilteringFilterChanged: function(payload, onCompleteCallback){
                this.trigger("filterChanged", payload, onCompleteCallback);
            },

            /**
             * Visibility State Management for the DOM.
             *
             * This removes state management from the dom.
             */
            wasShownPreviously: {},

            /**
             * Simple state management for which view we're currently on.
             */
            viewTypeSelected: "Data Visualization",

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

            templateHelpers: function () {
                var that = this;

                var TWITTER_PREFILL_TEXT = "Check out " + this.model.get("name") + " on CompEngine";

                if (!!this.model.get("contributor")) {
                    TWITTER_PREFILL_TEXT += " by " + this.model.get("contributor").name;
                }

                TWITTER_PREFILL_TEXT += " @compTimeSeries";

                return {
                    canContactContributor: !! this.model.get("contributor"),
                    twitterText: encodeURIComponent(TWITTER_PREFILL_TEXT),
                    viewTypeSelected: this.viewTypeSelected,
                    facebookEnabled: that.facebookEnabled
                }
            },

            /**
             * When the DOM is being painted.
             */
            onRender: function() {
                var that = this;
                /** Setup Slider **/
                this.__setupSlider();

                if(window.innerWidth < 1200 && window.innerWidth >= 1024) {
                    this.$el.find("[data-icon]").removeClass("icon-arrow-right")
                        .addClass("icon-arrow-down")
                }

                this.$el.find("[data-toggle-contributor-modal]").on("click", function () {
                    var modal = new App.Modals.ContactContributor.Modal({
                        model: new Backbone.Model({
                            contributorId: that.model.get("contributor").id,
                            name: that.model.get("name")
                        })
                    });
                    App.showModal(modal);
                });
            },

            /**
             *  Setup slider for sidebar.
             *
             * @private
             */
            __setupSlider: function() {
                var that = this;

                this.$el.find("#neighbours-slider").bootstrapSlider({
                    min: 1,
                    max: 100,
                    value: 20
                });

                this.$el.find("#neighbours-slider").bootstrapSlider().on("slideStop", function(changeEvent) {
                    that.$el.find("#neighbours-slider-value").text(changeEvent.value);
                    that.trigger("neighboursAmountChanged", changeEvent.value);
                });
            },

            /**
             *  When the filter button is clicked, we want to show the filtering prompt
             *
             * @param e {Event} The jQuery click event
             */
            onViewTypeSelectionChange: function(e) {
                var categoryEl = this.$el.find(".colour-keys").parent();

                this.trigger("viewChange", e.currentTarget.id);

                if("listView" === e.currentTarget.id) {
                    this.viewTypeSelected = "List View";
                } else {
                    this.viewTypeSelected = "Data Visualization";
                }

            },

            /**
             *  When you click the title of one of the sidebar panels, we'll simply toggle the visibility of its content
             *
             * @param e {Event} The click event
             */
            onDataRoleTitleClick: function(e) {
                var $el = $(e.currentTarget);
                var icon = $el.find("[data-icon]");

                this.toggleVisibilityState($el.attr("id"));

                if(icon.hasClass("icon-arrow-right")) {
                    icon.removeClass("icon-arrow-right")
                        .addClass("icon-arrow-down")
                } else {
                    icon.removeClass("icon-arrow-down")
                        .addClass("icon-arrow-right")
                }

                $el.parent().find("[data-role='content']").toggle(400);
            },

            /**
             * Get the visibility state of an element (Without DOM lookup)
             *
             * @param elementID {String} The ID of the element.
             * @returns {boolean} Returns the visibility state of the element (If it was not previously entered into
             *                    the state management, it will be treated as visible.)
             */
            getVisibilityState: function(elementID) {
                // Set an initial state
                if(undefined === this.wasShownPreviously[elementID]) {
                    this.wasShownPreviously[elementID] = true;
                }

                return this.wasShownPreviously[elementID];
            },

            /**
             * Toggle the visibility state of a given element without DOM lookup.
             *
             * @param elementID {String} The ID of the element.
             */
            toggleVisibilityState: function(elementID) {
                this.wasShownPreviously[elementID] = !this.getVisibilityState(elementID);
            },

            onShareFBClick: function(e) {
                if (this.facebookEnabled) {
                    FB.ui({
                        method: 'share',
                        href: window.location.href
                    });
                }
            },

            resetToDefault: function(){
                this.$el.find("#neighbours-slider").bootstrapSlider('setValue', 20);
                this.$el.find("#neighbours-slider-value").text(20);
            },

            /**
             * Set the currently viewed node's ID (Timeseries id, not temporary id)
             *
             * @param id {string} The ID as a string
             */
            setId: function(id) {
                var idExists = id !== undefined;
                var card = this.$el.find("[data-role='share-card']");
                var html = "";
                var that = this;

                var TWITTER_PREFILL_TEXT = "Check out " + this.model.get("name") + " on CompEngine";

                if (!!this.model.get("contributor")) {
                    TWITTER_PREFILL_TEXT += " by " + this.model.get("contributor").name;
                }

                TWITTER_PREFILL_TEXT += " @compTimeSeries";

                if (idExists) {
                    html = _.template(SocialCard)({
                        twitterText: encodeURIComponent(TWITTER_PREFILL_TEXT),
                        facebookEnabled: that.facebookEnabled
                    });
                }

                card.html(html);
            }

        });

    });

});