/**
 *  Admin Login Page
 *
 * @module pages/admin-login-page
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
    var AuthenticationController = require("../controllers/authentication-controller");
    var Footer = require("modules/common/views/footer/footer");
    var IdentityAccessManager = require("modules/common/controllers/identity-access-management");
    var Navigation = require("modules/common/views/navigation/navigation");
    var Validation = require("../controllers/validation-controller");

    var Template = require("text!./admin-login-page.html");

    /** Define module **/
    App.module("AdminLoginPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

            events: {
                "submit #login-form": "onFormSubmit"
            },

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
                footer: "#footer-container",
                navigation: "#navigation-container"
            },

            /**
             *  Listen to the events propagated from the subviews
             */
            subViewEvents: {
                "navigation render": "onXNavigationRender"
            },

            onFormSubmit: function(e) {
                e.preventDefault();
                var that = this;
                var form = this.$el.find("#login-form");
                form.find(".btn").addClass("btn-loader");
                this.$el.find("#api-error").slideUp();

                if(this.validate()) {
                    var auth = new Module.Authentication();
                    var email = form.find("#email").val().trim();
                    var password = form.find("#password").val().trim();

                    auth.login({ email: email, password: password }, that.onLoginFinish.bind(that));
                } else {
                    form.find(".btn").removeClass("btn-loader");
                }

            },

            /**
             * When the login has finished, we'll run a callback to find out what to do.
             *
             * @param message {string} The string response (success/error)
             * @param response {Object} An object that contains the status & error message to display (And original error obj)
             */
            onLoginFinish: function(message, response) {
                this.$el.find("#login-form").find(".btn").removeClass("btn-loader");

                if (message === "success") {
                    App.IdentityAccessManagement.Controller.startSession(response);
                    Backbone.history.navigate("/!admin/dashboard", {
                        trigger: true,
                        replace: true
                    });
                }

                if (message === "error") {
                    this.$el.find("#api-error").text(response.error).slideDown();
                }
            },

            /**
             *  Set active state on navigation once it has rendered.
             */
            onXNavigationRender: function() {
                this.navigation.setNavigationItemAsActive("admin-diagnostics");
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

            /**
             * When the DOM is finished painting, we will hide the loader.
             */
            onRender: function(){
                App.hidePageLoader();
            },

            validate: function() {
                var validationController = new Module.Validation();
                var form = this.$el.find("#login-form");

                var emailValid = validationController.validateEmail({
                    el: form.find("#email"),
                    errorEl: form.find("#email-error")
                });

                var passwordValid = validationController.validatePassword({
                    el: form.find("#password"),
                    errorEl: form.find("#password-error")
                });

                return emailValid && passwordValid;

            }

        });

    });

});