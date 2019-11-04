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
    var ConfigurationStore = require("modules/common/controllers/configuration-store");
    var Footer = require("modules/common/views/footer/footer");
    var Navigation = require("modules/common/views/navigation/navigation");
    var ValidationController = require("modules/common/controllers/validation-controller");

    /** Template **/
    var Template = require("text!./contact.html");

    /** Define module **/
    App.module("ContactPage", function(Module, Application, Backbone) {

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
                name: "#name",
                emailAddress: "#email-address",
                message: "#message",
                sendCopy: "#send-copy",
                sendButton: "#send-btn",
                successMessage: "#success-message",
                errorMessage: "#error-message"
            },

            /**
             * On initialization, we'll setup a Configuration controller.
             */
            initialize: function() {
                this.configStore = new App.ConfigurationStore.Controller();
            },

            onRender: function () {
                var that = this;

                this.ui.sendButton.click(function () {
                    var formData = that.serialize();
                    that.__sendMessage(formData);
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

            __sendMessage: function (formData) {
                var that = this;
                that.ui.errorMessage.hide();
                that.ui.successMessage.hide();
                that.ui.sendButton.addClass("btn-loader");

                if (this.validate()) {
                    $.ajax(App.apiEndpoint() + "/contact-us", {
                        type: "POST",
                        data: JSON.stringify(formData)
                    }).success(function () {
                        that.__resetForm();
                        that.ui.successMessage.show();
                        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
                    }).error(function (response) {
                        try {
                            var responseJson = JSON.parse(response.responseText);
                        } catch(e) {}

                        if (responseJson && responseJson.message && responseJson.showOnFront) {
                            that.ui.errorMessage.text(responseJson.message);
                        } else {
                            that.ui.errorMessage.text(that.GENERIC_ERROR_MESSAGE);
                        }

                        that.ui.errorMessage.show();
                        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
                    }).always(function () {
                        that.ui.sendButton.removeClass("btn-loader");
                    });
                } else {
                    that.ui.sendButton.removeClass("btn-loader");
                }

            },

            serialize: function () {
                var that = this;
                return  {
                    name: that.ui.name.val(),
                    emailAddress: that.ui.emailAddress.val(),
                    message: that.ui.message.val(),
                    sendCopy: that.ui.sendCopy.prop("checked")
                };
            },

            __resetForm: function () {
                this.ui.name.val("");
                this.ui.emailAddress.val("");
                this.ui.message.val("");
                this.ui.sendCopy.prop("checked", false);
            },

            /**
             * Validate all fields
             *
             * @returns {boolean} Returns true if all fields are valid
             */
            validate: function() {
                var nameValid = this.__validateName();
                var emailValid = this.__validateEmailAddress();
                var messageValid = this.__validateMessage();

                return nameValid && emailValid && messageValid;
            },

            __validateName: function() {
                var valid = true;
                var errorMessage;
                var errorEl = this.$el.find("#name-error");
                var val = this.ui.name.val().trim();

                if (App.Validation.Controller.emptyString(val)) {
                    errorMessage = "Name is a required field";
                    valid = false;
                }

                if (!valid) {
                    errorEl.text(errorMessage).slideDown();
                } else {
                    errorEl.slideUp();
                }

                return valid;
            },

            __validateEmailAddress: function() {
                var valid = true;
                var errorMessage;
                var val = this.ui.emailAddress.val().trim();
                var errorEl = this.$el.find("#email-error");

                if (App.Validation.Controller.emptyString(val)) {
                    errorMessage = "Email is a required field";
                    valid = false;
                }

                if (valid && !App.Validation.Controller.validEmail(val)) {
                    errorMessage = "Email must be a valid email address";
                    valid = false;
                }

                if (!valid) {
                    errorEl.text(errorMessage).slideDown();
                } else {
                    errorEl.slideUp();
                }

                return valid;
            },

            __validateMessage: function() {
                var valid = true;
                var errorMessage;
                var val = this.ui.message.val().trim();
                var errorEl = this.$el.find("#message-error");

                if (App.Validation.Controller.emptyString(val)) {
                    errorMessage = "Message is a required field";
                    valid = false;
                }

                if (!valid) {
                    errorEl.text(errorMessage).slideDown();
                } else {
                    errorEl.slideUp();
                }

                return valid;
            }

        });

    });

});