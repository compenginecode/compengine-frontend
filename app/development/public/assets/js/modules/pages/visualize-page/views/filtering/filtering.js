/**
 *  Filtering
 *
 * @module modules/pages/visualize-page/filtering
 * @memberof Pages
 * @see Pages
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var ManagedView = require("modules/common/views/managed-view/managed-view");
    var Marionette = require("marionette");
    var Radio = require("backbone.radio");

    /** Controllers **/
    var SourceController = require("../../controllers/source-controller");
    var TagsController = require("../../controllers/tags-controller");

    /** Template **/
    var Template = require("text!./filtering.html");

    /** Define module **/
    App.module("VisualizePage.Filtering", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = App.Common.Views.ManagedView.View.extend({

            events: {
                "click #filter-button": "onFilterButtonClick",
                "click #export-button": "onExportButtonClick",
                "click #apply-filter": "onApplyFilterButtonClick",
                "click [data-role='clear-source']": "onClearSourceClick",
                "click #export": "onExportDataButtonClick"
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
             * Template helpers
             * 
             * @returns {Object} Template helpers
             */
            templateHelpers: function() {
                var that = this;

                return {
                    filteringOptions: that.filteringModel.toJSON(),
                    determineCheckedCategory: function(type) {
                        var current = that.filteringModel.get("topLevelCategory");
                        var checked = false;

                        if ((type === "any" && null == current) || (type === current)) {
                            checked = true;
                        }

                        return checked;
                    }
                };
            },

            /**
             *  Initialization
             *
             * @param options {Object} Options you want to pass through.
             */
            initialize: function(options){
                App.Common.Views.ManagedView.View.prototype.initialize.call(this, options);
                this.registerController(new App.VisualizePage.Controllers.TagsController(this));
                this.registerController(new App.VisualizePage.Controllers.SourceController(this));
                this.filteringModel = new Backbone.Model();
            },

            hideExportModes: function(){
                this.$el.find("#export-mode").hide();
                this.exportModesHidden = true;
            },

            showExportModes: function(){
                this.$el.find("#export-mode").show();
                this.exportModesHidden = false;
            },

            /**
             * When dom is rendered
             */
            onRender: function() {
                /** Call to super **/
                App.Common.Views.ManagedView.View.prototype.onRender.call(this);
                this.hideExportModes();
                this.trigger("set:source", this.filteringModel.get("source"));
                this.trigger("set:tags", this.filteringModel.get("tags"));
            },

            onExportDataButtonClick: function(){
                var mode = "all";

                if (!this.exportModesHidden) {
                    mode = this.$el.find('input[name="export-type"]:checked').val();
                }

                this.trigger("export", mode, this.$el.find("#export-type").val());
            },

            /**
             * When you click the filter button
             */
            onFilterButtonClick: function(ev) {
                var that = this;
                var filter = this.$el.find("#filter-options");

                ev.currentTarget.classList.toggle("activeBtn");
                
                if(ev.currentTarget.classList.contains("activeBtn")) {
                    this.$el.find("#export-button").hide(0);
                    filter.slideDown(400, function() {
                        filter.find("#filter-content").show();
                    });
                } else {
                    window.setTimeout(function() {
                        // this = window, that = view.
                        that.$el.find("#export-button").fadeIn(400);
                    }, 400);
                    filter.slideUp(400, function() {
                        filter.find("#filter-content").hide();
                    });
                }

                ev.currentTarget.parentElement.style = "height: 44px;";
            },

            /**
             * When you click the export button, expand the button & show the details for export
             *
             * @param ev {Event} The click event
             */
            onExportButtonClick: function(ev) {
                var that = this;
                var exp = this.$el.find("#export-options");
                var filterBtn = this.$el.find("#filter-button");

                ev.currentTarget.classList.toggle("activeBtn");

                if(ev.currentTarget.classList.contains("activeBtn")) {
                    filterBtn.hide(0);
                    exp.slideDown(400, function() {
                        exp.find("#export-content").show();
                    });
                } else {
                    window.setTimeout(function() {
                        // this = window, that = view.
                        filterBtn.fadeIn(400);
                    }, 400);
                    exp.slideUp(400, function() {
                        exp.find("#export-content").hide();
                    });
                }

                ev.currentTarget.parentElement.style = "height: 44px;";
            },

            /**
             *  When the user clicks the apply filter button, we will unfocus (Blur) the button and then send
             *  to the server that we request new data.
             *
             * @param e {Event} The click event
             */
            onApplyFilterButtonClick: function(e) {
                var that = this;
                e.preventDefault();
                e.currentTarget.blur();

                $(e.currentTarget).addClass("btn-loader");

                var payload = {};
                var selectedCategory = this.$el.find("#topLevelCategoryFilter").find("input:checked").attr("id");
                var isValid = true;

                this.controllers.forEach(function(aController){
                    isValid = isValid & aController.validate();
                    var serializedData = aController.serialize();
                    _.each(serializedData, function(data, index) {
                        payload[index] = data;
                    });
                });

                payload.topLevelCategory = selectedCategory;

                /** If it returns a truthy value, proceed. **/
                if(isValid == true) {
                    this.filteringModel.set(payload)
                    this.trigger("filterChanged", payload, function(){
                        $(e.currentTarget).removeClass("btn-loader");
                    });
                }
            },

            /**
             *  Get the Tags Input field
             *
             * @returns {jQuery} The tags input field (jQuery Object)
             * @public
             */
            getTagsInputField: function() {
                return this.$el.find("#filter-options").find("#tags");
            },

            /**
             * Returns the tags container
             *
             * @returns {*|jQuery}
             */
            getTagContainer: function() {
                return this.$el.find("#filter-options").find("#tag-container");
            },

            /**
             *  Get the Tags Input field
             *
             * @returns {jQuery} The tags input field (jQuery Object)
             * @public
             */
            getSourceInputField: function() {
                return this.$el.find("#filter-options").find("#source");
            },

            /**
             * Show the clear button for the source input
             */
            showClearButton: function() {
                this.$el.find("#source-input")[0].classList = "col-md-9";
                this.$el.find("#clear-button").show();
            },

            /**
             * Hide clear button for the source input
             */
            hideClearButton: function() {
                this.$el.find("#clear-button").hide();
                this.$el.find("#source-input")[0].classList = "col-md-12";
            },

            /**
             * When the user clicks the clear link
             *
             * @param e {Event} The click event.
             */
            onClearSourceClick: function(e) {
                e.preventDefault();
                this.hideClearButton();

                this.getSourceInputField().val("").focus();
            }

        });

    });

});