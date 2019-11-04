/**
 *  Contribution Metadata Modal
 *
 * @module modals/contribution-metadata-modal
 * @memberof Modals
 * @see Modals
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");
    var Radio = require("backbone.radio");

    /** Modal dependencies **/
    var BaseModal = require("modules/modals/base-modal/base-modal");
    var ManagedView = require("modules/common/views/managed-view/managed-view");

    /** Local dependencies **/
    var Bootstrap = require("bootstrap");

    /** Controllers **/
    var CategoryController = require("./controllers/category-controller");
    var SamplingRateController = require("./controllers/sampling-rate-controller");
    var SourceController = require("./controllers/source-controller");
    var StaticDataController = require("./controllers/static-data-controller");
    var TagsController = require("./controllers/tags-controller");
    var ContributorController = require("./controllers/contributor-controller");

    /** Models **/
    var TimeSeriesModel = require("./models/timeseries");
    var TimeSeriesContribution = require("modules/common/event-tracking/time-series-contribution");

    /** Template **/
    var Template = require("text!./modal.html");

    /**
     * Define module
     *
     * @constructor
     * @protected
     */
    App.module("Modals.ContributionMetadata", function(Module, Application, Backbone) {

        /**
         *  Module view, Inherits ManagedView
         *
         * @protected
         * @see ManagedView
         */
        Module.Body = App.Common.Views.ManagedView.View.extend({

            STR_SOMETHING_WENT_WRONG: "Oh no, something's gone wrong. Please try again.",

            /**
             *  When the modal has been invoked, we start here.
             *
             * @private
             */
            initialize: function(){
                /** Reset all controllers **/
                this.controllers = [];
                /** Register controllers **/
                this.registerController(new Module.Controllers.SourceController(this));
                this.registerController(new Module.Controllers.TagsController(this));
                this.registerController(new Module.Controllers.CategoryController(this));
                this.registerController(new Module.Controllers.ContributorController(this));
                this.registerController(new Module.Controllers.SamplingRateController(this));
                this.registerController(new Module.Controllers.StaticDataController(this));   
            },

            /**
             *  When the dom has been rendered, we want to manipulate the DOM with some plugins.
             *
             * @private
             */
            onRender: function() {
                _.each(this.controllers, function (controller) {
                    controller.reinitialize && controller.reinitialize();
                });

                App.Common.Views.ManagedView.View.prototype.onRender.call(this);

                /** Allow tooltips inside of the modal. **/
                this.$el.find("[data-toggle='tooltip']").tooltip();
            },

            /**
             *  Get the sources input field
             *
             * @returns {jQuery} The sources input field (jQuery Object)
             * @public
             */
            getSourcesInputField: function(){
                return this.$el.find("#sources");
            },

            /**
             *  Get the Tags Input field
             *
             * @returns {jQuery} The tags input field (jQuery Object)
             * @public
             */
            getTagsInputField: function() {
                return this.$el.find("#tags");
            },

            /**
             *  Get the category element
             *
             * @returns {jQuery} The category element (jQuery Object)
             * @public
             */
            getCategorySelectionElement: function() {
                return this.$el.find("#category");
            },

            /**
             *  Get the category suggestion container
             *
             * @returns {jQuery} The category suggestion element (jQuery Object)
             * @public
             */
            getCategorySuggestionElement: function() {
                return this.$el.find("#suggest-category");
            },

            /**
             *  Get the category suggestion field
             *
             * @returns {jQuery} The category suggestion element (jQuery Object)
             * @public
             */
            getCategorySuggestionInputField: function() {
                return this.$el.find("#suggested-category");
            },

            /**
             *  Get the "privacy policy read" checkbox field
             *
             * @returns {jQuery} The input field (jQuery Object)
             * @public
             */
            getPrivacyPolicyAgreedCheckboxField: function(){
                return this.$el.find("#privacy-policy-agreed-checkbox");
            },

            /**
             *  Get the "contact permission" checkbox field
             *
             * @returns {jQuery} The input field (jQuery Object)
             * @public
             */
            getContactPermissionCheckboxField: function() {
                return this.$el.find("#contact-permission-checkbox");
            },

            /**
             *  Get the "aggregation permission" checkbox field
             *
             * @returns {jQuery} The input field (jQuery Object)
             * @public
             */
            getAggregationPermissionCheckbox: function() {
                return this.$el.find("#aggregation-permission-checkbox");
            },

            /**
             *  Get the section containing all the contributor information fields
             *
             * @returns {jQuery} The input field (jQuery Object)
             * @public
             */
            getContributorInformationSection: function(){
                return this.$el.find("#contributor-information");
            },

            /**
             *  Get the "contributor name" field
             *
             * @returns {jQuery} The input field (jQuery Object)
             * @public
             */
            getContributorInformationName: function(){
                return this.$el.find("#contributor-information-name");
            },

            /**
             *  Get the "contributor email address" field
             *
             * @returns {jQuery} The input field (jQuery Object)
             * @public
             */
            getContributorInformationEmailAddress: function(){
                return this.$el.find("#contributor-information-email-address");
            },

            /**
             *  Get the time series name input field
             *
             * @returns {jQuery} The category element (jQuery Object)
             */
            getTimeSeriesNameInputField: function(){
                return this.$el.find("#time-series-name");
            },

            /**
             *  Get the description input field
             *
             * @returns {jQuery} The description input field (jQuery Object)
             */
            getDescriptionInputField: function(){
                return this.$el.find("#description");
            },

            /**
             *  Get the sampling rate checkbox field
             *
             * @returns {jQuery} The tags input field (jQuery Object)
             * @public
             */
            getSamplingRateCheckbox: function() {
                return this.$el.find("#sampling-rate-present");
            },

            /**
             *  Get the container of inputs for the Sampling rate & unit
             *
             * @returns {jQuery} The tags input field (jQuery Object)
             * @public
             */
            getSamplingRateInputPresent: function() {
                return this.$el.find("[data-id='sampling-rate-present-true']");
            },

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel {Object} An object with data for the template to render
             * @returns {Function} Rendered template
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            /**
             *  Serializes all the user input into a single object. We request each
             *  controller to contribute their part and we merge the results.
             *
             * @returns {{}}
             */
            serialize: function(){
                var results = {};
                this.controllers.forEach(function(aController){
                    results = _.extend(results, aController.serialize());
                });

                return results;
            },

            /**
             *  Validates all the user input widgets. We request each controller
             *  to validate their part, ANDing the results together.
             *
             * @returns {boolean}
             */
            validate: function(){
                var result = true;
                this.controllers.forEach(function(aController){
                    result = result & aController.validate();
                });

                return result;
            },

            showGlobalError: function(){
                this.$el.find("[fatal-error]").text(this.STR_SOMETHING_WENT_WRONG).show();
            },

            /**
             *  Iterates through all the controllers and passes the server failure message to
             *  each one, allowing them to decide if and how they want to respond.
             *
             * @param classification
             * @private
             */
            handleServerFail: function(classification){
                this.controllers.forEach(function(aController){
                    aController.handleServerFail(classification);
                });
            },

            /**
             *  Given a string, It will check whether that string is an alphanumeric string or contains
             *  special characters.
             *
             * @param string {string} The string of the key that was pressed.
             * @returns {boolean} Will return true/false depending on if the input was a letter or number.
             * @private
             */
            __checkAlphaNumericValidity: function(string) {
                return /^[a-z0-9]+$/i.test(string);
            }
        });

        Module.Modal = App.Modals.BaseModal.Modal.extend({

            /**
             *  The body view for the modal
             *
             * @protected
             */
            bodyView: Module.Body,

            /**
             *  Constructor. We override the default constructor and add code to help
             *  handle the specific parameters passed. We also register events into the
             *  modal.
             *
             * @param options
             */
            initialize: function(options){
                App.Modals.BaseModal.Modal.prototype.initialize.call(this, options);

                options = options || {};

                if (!options.resultKey){
                    throw new Error("Please boot the modal with a resultKey options attribute.");
                }

                this.events = this.events || {};
                this.events["click [data-action='contribute']"] = "__onContributeButtonClick";
            },

            /**
             *  Called when the "contribute" button is clicked. We first check if the view is valid,
             *  and if it is, serialize the view and send it off to the server.
             *
             * @private
             */
            __onContributeButtonClick: function(){
                var that = this;
                var $button = this.$el.find("[data-action='contribute']");
                var modalChannel = Backbone.Radio.channel("modals");
                $button.addClass("btn-loader").blur();

                this.view.$el.find("[fatal-error]").hide();

                if (this.view.validate()){
                    var timeSeriesModel = new Module.Models.TimeSeries(this.view.serialize());
                    timeSeriesModel.set("resultKey", this.options.resultKey);

                    var deferred = timeSeriesModel.save();

                    deferred.fail(function(xhrResponse){
                        if (xhrResponse.responseJSON && xhrResponse.responseJSON.class){
                            that.view.handleServerFail(xhrResponse.responseJSON.class);
                        }else{
                            that.view.showGlobalError();
                        }
                    });

                    deferred.done(function(responseObj){
                        modalChannel.trigger("modalCompletedSuccess", responseObj);

                        var timeSeriesContributionEvent = new App.Common.EventTracking.TimeSeriesContribution();
                        timeSeriesContributionEvent.send();
                        // App.trackEvent("time-series-contribution", {
                        //     id: responseObj.uri
                        // });

                        App.router.navigate("!visualize/" + responseObj.uri, {
                            trigger: true
                        });
                    });

                    deferred.error(function(response) {
                        $button.removeClass("btn-loader");
                    });

                } else {
                    $button.removeClass("btn-loader");
                }
            },

            triggerCancel: function() {
                App.Modals.BaseModal.Modal.prototype.triggerCancel.call(this);
                this.trigger("cancel");
                this.view.trigger("cancel");
            }

        });

    });

});
