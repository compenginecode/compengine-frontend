/**
 *  About Page
 *
 * @module pages/about
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
    var Bytes = require("bytes");
    var ConfigurationStore = require("modules/common/controllers/configuration-store");
    var Footer = require("modules/common/views/footer/footer");
    var Navigation = require("modules/common/views/navigation/navigation");
    var ValidationController = require("modules/common/controllers/validation-controller");

    /** Template **/
    var Template = require("text!./download.html");

    /** Define module **/
    App.module("DownloadPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

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
             * On initialization, we'll setup a Configuration controller.
             */
            initialize: function() {
                this.configStore = new App.ConfigurationStore.Controller();
            },

            onRender: function () {
                var that = this;
                this.ui.submitButton.click(function () {
                    var formData = that.serialize();
                    that.__submitForm(formData);
                });

                App.hidePageLoader();
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

            templateHelpers: function() {
                var that = this;

                return {
                    exportedDataSizes: that.configStore.getExportedDataSizes(),
                    byteToSize: function(byte) {
                        return Bytes(byte, { unitSeparator: ' ' });
                    }
                };
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
                        App.trackEvent("download", {
                            data: JSON.stringify(formData)
                        });
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