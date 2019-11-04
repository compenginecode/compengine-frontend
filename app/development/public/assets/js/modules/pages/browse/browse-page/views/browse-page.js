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
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var ConfigurationStore = require("modules/common/controllers/configuration-store");
    var Footer = require("modules/common/views/footer/footer");
    var Navigation = require("modules/common/views/navigation/navigation");
    var ContactContributorModal = require("modules/modals/contact-contributor-modal/modal");
    //var CategoryCollection = require(".././category-collection");
    //var Category = require(".././category");
    //var CategoryCard = require("./.././category-card");
    var SocialView = require("modules/common/views/social-view/social-view");
    var Bytes = require("bytes");
    var ValidationController = require("modules/common/controllers/validation-controller");
    var DownloadEvent = require("modules/common/event-tracking/download");

    /** Template **/
    var Template = require("text!./browse-page.html");

    /** Define module **/
    App.module("BrowsePage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = App.Common.Views.SocialView.View.extend({

            GENERIC_ERROR_MESSAGE: "Whoops! That didn't work. Maybe try again.",

            /**
             * Subviews
             */
            subViews: {
                footer: App.Common.Footer.View,
                navigation: App.Common.Navigation.View
            },

            /**
             * Containers for the sub views
             */
            subViewContainers: {
                footer: "#footer-container",
                navigation: "#navigation-container"
            },

            ui: {
                emailAddress: "#email-address",
                exportType: "#export-type",
                submitButton: "#submit-btn",
                successMessage: "#success-message",
                errorMessage: "#error-message",
                emailAddressError: "[data-error='email-address-error']"
            },

            /**
             * Custom social tags for this view
             *
             * @protected
             */
            socialTags: {
                "og:title": "Browse CompEngine",
                "og:description": "Browse by category, source and tag"
            },

            /**
             * On initialization, we'll setup a Configuration controller.
             */
            initialize: function(options) {
                App.Common.Views.SocialView.View.prototype.initialize.call(this, options);

                this.configStore = new App.ConfigurationStore.Controller();

                // if (undefined !== options && undefined !== options.resultsList) {
                //     this.resultsList = options.resultsList;
                //     //this.subViews.resultsList = options.resultsList;
                // }
                //
                // if (undefined !== options && undefined !== options.view) {
                //     this.view = options.view;
                // }
                //
                // if (undefined !== this.view && undefined !== options[options.view] && null !== options[options.view]) {
                //     this.subViewName = options[options.view].name;
                // }
                //
                // if (undefined !== this.view && undefined !== options[options.view] && null !== options[options.view] && undefined !== options[options.view].subView) {
                //     this.secondarySubViewName = options[options.view].subView;
                // }
            },

            /**
             * Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            templateHelpers: function () {
                return {
                    timeSeriesCount: this.configStore.getTimeSeriesCount(),
                    exportedDataSizes: this.configStore.getExportedDataSizes(),
                    byteToSize: function(byte) {
                        return Bytes(byte, { unitSeparator: ' ' });
                    }
                }
            },

            onRender: function() {
                App.hidePageLoader();

                var that = this;

                // if (undefined !== this.view && null === this.subViewName) {
                //     this.$el.find("#browse-default").hide();
                //     this.$el.find("#" + this.view).show();
                // }
                //
                // if (undefined !== this.view && undefined !== this.subViewName && null !== this.subViewName && undefined === this.secondarySubViewName) {
                //     this.$el.find("#browse-default").hide();
                //     this.$el.find("#subCategory").show();
                // }
                //
                // if (undefined !== this.view && null !== this.subViewName && undefined !== this.secondarySubViewName) {
                //     this.$el.find("#browse-default").hide();
                //     this.$el.find("#secondarySubView").show();
                // }
                //
                // this.$el.find("#browse-default").hide();
                // this.subViews.resultsList = this.resultsList;

                // App.showModal(new App.Modals.ContactContributor.Modal());

                this.$el.find("form[role='search']").submit(function (e) {
                    if (query = $(this).find("input").val()) {
                        window.location = "/#!search/" + query;
                    }
                    e.preventDefault();
                });

                this.ui.submitButton.click(function () {
                    var formData = that.serialize();
                    that.__submitForm(formData);
                });
            },

            __submitForm: function (formData) {
                var that = this;
                that.ui.errorMessage.hide();

                if (this.validate()) {
                    that.ui.submitButton.addClass("btn-loader");
                    $.ajax(App.apiEndpoint() + "/time-series/export", {
                        type: "POST",
                        data: JSON.stringify(formData)
                    }).success(function () {
                        that.__resetForm();
                        that.ui.successMessage.show();
                        $("html, body").animate({scrollTop: $(document).height()}, "slow");
                        var downloadEvent = new App.Common.EventTracking.Download({
                            eventLabel: formData.exportType
                        });
                        downloadEvent.send();
                        // App.trackEvent("download", {
                        //     data: JSON.stringify(formData)
                        // });
                    }).error(function (response) {
                        if (response.responseJSON && response.responseJSON.showOnFront) {
                            that.ui.errorMessage.text(response.responseJSON.message);
                        } else {
                            that.ui.errorMessage.text(that.GENERIC_ERROR_MESSAGE);
                        }
                        that.ui.errorMessage.show();
                        $("html, body").animate({scrollTop: $(document).height()}, "slow");
                    }).always(function () {
                        that.ui.submitButton.removeClass("btn-loader");
                    });
                }
            },

            serialize: function () {
                var that = this;
                return  {
                    emailAddress: that.ui.emailAddress.val(),
                    exportType: that.ui.exportType.val()
                };
            },

            __resetForm: function () {
                this.ui.emailAddress.val("");
                this.ui.exportType.val(this.ui.exportType.find("option").val());
            },

            validateEmailAddress: function() {
                var email = this.ui.emailAddress.val();

                if (App.Validation.Controller.emptyString(email)) {
                    this.ui.emailAddressError.text("Email is a required field").show();
                    return false;
                }

                if (!App.Validation.Controller.validEmail(email)) {
                    this.ui.emailAddressError.text("Please enter a valid email address").show();
                    return false;
                }

                this.ui.emailAddressError.hide();
                return true;
            },

            validate: function () {
                this.ui.errorMessage.hide();
                this.ui.successMessage.hide();
                return this.validateEmailAddress();
            }

        });

    });

});