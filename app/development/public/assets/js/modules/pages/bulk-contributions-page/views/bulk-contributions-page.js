/**
 *  Bulk Contributions Page
 *
 * @module pages/bulk-contributions-page
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
    var BulkContributionModal = require("modules/modals/bulk-contribution-modal/modal");
    var ConfigurationStore = require("modules/common/controllers/configuration-store");
    var ContributionMetadataPrompt = require("modules/prompts/recontribute-metadata-prompt/prompt");
    var Dropzone = require("./dropzone/dropzone");
    var DropzoneErrorModal = require("modules/modals/dropzone-error-modal/modal");
    var Footer = require("modules/common/views/footer/footer");
    var LocalForage = require("localForage");
    var Navigation = require("modules/common/views/navigation/navigation");
    var Typed = require("typed");
    var ManagedView = require("modules/common/views/managed-view/managed-view");
    /** Controllers **/
    var CategoryController = require("modules/modals/contribution-metadata-modal/controllers/category-controller");
    var SamplingRateController = require("../controllers/sampling-rate-controller");
    var RootWordController = require("../controllers/root-word-controller");
    var TagsController = require("../controllers/tags-controller");
    var PrivacyController = require("../controllers/privacy-controller");

    var Template = require("text!./bulk-contributions-page.html");

    /** Define module **/
    App.module("BulkContributions", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = App.Common.Views.ManagedView.View.extend({

            STR_SOMETHING_WENT_WRONG: "Oh snap, something went wrong, try again perhaps?",

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
                dropzone: "#dropzone-container",
                footer: "#footer-container",
                navigation: "#navigation-container"
            },

            ui: {
                totalFilesUploaded: "#total-files-uploaded",
                successMessage: "#success-message",
                mobileWarning: "#mobile-warning"
            },

            events: {
                "click [data-action='contribute']": "__onImDoneButtonClick"
            },

            /**
             * Custom social tags for this view
             *
             * @protected
             */
            socialTags: {
                "og:title": "Contribute multiple files to CompEngine"
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

            templateHelpers: function () {
                var that = this;
                return {
                    recaptcha: GLOBALS.recaptcha,
                    totalFilesUploaded: function () {
                        return new Date();
                        return that.timeSeriesIds.length;
                    }
                }
            },

            tokens: new Backbone.Model({"approvalToken": null, "exchangeToken": null}),

            timeSeriesIds: new Backbone.Collection(),

            initialize: function(options) {
                var that = this;
                App.Common.Views.SocialView.View.prototype.initialize.call(this, options);

                this.showMeta = options.showMeta || false;

                this.tokens.set("approvalToken", this.options.token);
                this.subViews.dropzone= function () {
                    return new Module.Dropzone.View({model: that.tokens});
                };

                /** Reset all controllers **/
                this.controllers = [];

                /** Register controllers **/
                this.registerController(new Module.Controllers.TagsController(this));
                this.registerController(new App.Modals.ContributionMetadata.Controllers.CategoryController(this));
                this.registerController(new Module.Controllers.SamplingRateController(this));
                this.registerController(new Module.Controllers.RootWordController(this));
                this.registerController(new Module.Controllers.PrivacyController(this));
            },

            onRender: function() {
                var that = this;

                App.Common.Views.ManagedView.View.prototype.onRender.call(this);

                /** Check mobile compatibility */
                if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    that.ui.mobileWarning.show();
                }

                /** Allow tooltips inside of the modal. **/
                this.$el.find("[data-toggle='tooltip']").tooltip();

                this.dropzone.on("fileSent", function (timeSeriesId) {
                    that.timeSeriesIds.add(new Backbone.Model({timeSeriesId: timeSeriesId}));
                });

                this.dropzone.on("complete", function () {
                    // console.log(that.timeSeriesIds);
                    if (that.timeSeriesIds.length > 0) {
                        $("#add-meta-data").show();
                    } else {
                        $("#start-again").show();
                    }
                });

                /**
                 * The user hits a dead end where none of there files can be uploaded.
                 * Option to refresh the upload process so they can try uploading different files.
                 */
                this.$el.on("click", "#start-again", function () {
                    location.reload();
                });

                /**
                 * We've got our uploaded timeseries ids and now we need to show the meta data form and submit them
                 */
                this.$el.on("click", "#add-meta-data", function () {
                    $("#dropzone-container").fadeOut(300).promise().then(function () {
                        that.ui.totalFilesUploaded.text(that.timeSeriesIds.length);
                        $("#meta").fadeIn(200);
                    });
                });

                this.loadCaptcha();

                App.hidePageLoader();
            },

            loadCaptcha: function() {
                var that = this;

                // skip captcha while testing
                // TODO: Remove after testing
                // var exchangeToken = "la3HhD7USl2B9GnSBo388hGbL8uMaqisXMtYIxCXwaxL2MMKaX4P1WKkZMGQpigIpJvhtcgqsrEkSSDe2r0Nq6X2XlkY8bJOmJ1hY4n9PKgSD3xZ7g5s1uLaWU3HQTub";
                // this.tokens.set("exchangeToken", exchangeToken);
                // this.$el.find("#not-a-robot").hide();
                // this.$el.find("#dropzone-container").show();
                //
                // var sampleTimeSeriesId = "5c342302-1b46-11e7-81e6-4ccc6a8ad79a";
                // this.timeSeriesIds.add(new Backbone.Model({timeSeriesId: sampleTimeSeriesId}));
                // that.ui.totalFilesUploaded.text(that.timeSeriesIds.length);
                // this.$el.find("#meta").show();
                // return;

                var getRecaptchaResponse = function(response) {
                    $.ajax(App.apiEndpoint() + "/bulk-upload-requests/not-a-robot", {
                        type: "POST",
                        dataType: "json",
                        data: JSON.stringify({
                            recaptchaResponseCode: response,
                            approvalToken: that.tokens.get("approvalToken")
                        })
                    }).success(function (response) {
                        that.tokens.set("exchangeToken", response.exchangeToken);
                        $("#not-a-robot").fadeOut(300).promise().then(function () {
                            $("#dropzone-container").fadeIn(200);
                        });
                    });
                };

                var renderCaptcha = function() {
                    that.captchaWidgetId = grecaptcha.render("recaptcha-container", {
                        sitekey : GLOBALS.recaptcha,
                        callback: getRecaptchaResponse
                    });
                };

                window.renderCaptcha = renderCaptcha;

                this.__checkExpiredApprovalToken(function () {
                    $.getScript('https://www.google.com/recaptcha/api.js?onload=renderCaptcha&render=explicit', function() {});
                });

            },

            __checkExpiredApprovalToken: function (callback) {
                var that = this;
                $.ajax(App.apiEndpoint() + "/bulk-upload-requests/not-a-robot", {
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify({
                        recaptchaResponseCode: "this doesnt matter as the approval token gets validated first",
                        approvalToken: that.tokens.get("approvalToken")
                    })
                }).error(function (response) {
                    var message = response.responseJSON.message;
                    if ("approvalToken expired or invalid" === message) {
                        that.$el.find("[fatal-error]").text("The bulk contribution token you have used is expired. Try submitting a new bulk upload request to get a valid token.").show();
                    } else {
                        callback();
                    }
                });
            },

            showGlobalError: function(){
                this.$el.find("[fatal-error]").text(this.STR_SOMETHING_WENT_WRONG).show();
                $("html, body").animate({ scrollTop: $(document).height() }, "slow");
            },

            handleServerFail: function(classification){
                this.controllers.forEach(function(aController){
                    if (aController.handleServerFail) {
                        aController.handleServerFail(classification);
                    }
                });
            },

            /**
             *  Called when the "I'm done!" button is clicked. We first check if the view is valid,
             *  and if it is, serialize the view and send it off to the server.
             *
             * @private
             */
            __onImDoneButtonClick: function(){
                var that = this;
                var $button = this.$el.find("[data-action='contribute']");
                $button.addClass("btn-loader").blur();

                this.$el.find("[fatal-error]").hide();

                if (this.validate()){
                    var metadata = this.serialize();
                    var payload = {
                        timeSeries: that.timeSeriesIds.map(function (timeSeries) {
                            return timeSeries.get("timeSeriesId");
                        }),
                        approvalToken: that.tokens.get("approvalToken"),
                        exchangeToken: that.tokens.get("exchangeToken"),
                        allowContact: that.getAllowContactInput().prop("checked"),
                        wantsAggregationEmail: that.getAggregationPermissionCheckboxField().prop("checked"),
                        metadata: {
                            category: metadata.categoryId,
                            samplingRate: metadata.samplingRate,
                            samplingUnit: metadata.samplingUnit,
                            tags: metadata.tags,
                            rootWord: metadata.rootWord
                        }
                    };

                    var deferred = $.ajax(App.apiEndpoint() + "/bulk-upload-requests/submit", {
                        type: "POST",
                        data: JSON.stringify(payload)
                    });

                    deferred.fail(function(xhrResponse){
                        if (xhrResponse.responseJSON && xhrResponse.responseJSON.class){
                            that.handleServerFail(xhrResponse.responseJSON.class);
                        }else{
                            that.showGlobalError();
                        }
                    });

                    deferred.done(function(responseObj){
                        $button.removeClass("btn-loader");
                        that.$el.find("#meta").fadeOut(300).promise().then(function () {
                            that.ui.successMessage.fadeIn(200);
                        });
                    });

                    deferred.error(function(response) {
                        $button.removeClass("btn-loader");
                    });

                } else {
                    $button.removeClass("btn-loader");
                }
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
            getAggregationPermissionCheckboxField: function() {
                return this.$el.find("#weekly-email-checkbox");
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
             *  Get the container of inputs for the Sampling rate & unit
             *
             * @returns {jQuery} The tags input field (jQuery Object)
             * @public
             */
            getSamplingRateInputPresent: function() {
                return this.$el;
            },

            /**
             *  Get the container of inputs for the Sampling rate & unit
             *
             * @returns {jQuery} The tags input field (jQuery Object)
             * @public
             */
            getAllowContactInput: function() {
                return this.$el.find("#contact-permission-checkbox");
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

    });

});
