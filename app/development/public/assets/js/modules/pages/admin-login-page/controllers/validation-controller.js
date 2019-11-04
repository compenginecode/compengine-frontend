define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var ValidationController = require("modules/common/controllers/validation-controller");

    /** Module definition **/
    App.module("AdminLoginPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.Validation = Marionette.Object.extend({

            /**
             * Validate the email field
             *
             * @param options {Object} Object of options that contains the element & error element.
             * @returns {boolean} Returns true if email is valid.
             */
            validateEmail: function(options) {
                var el = options.el;
                var errorEl = options.errorEl;
                var email = el.val().trim();
                var valid = true;
                var message;

                if (App.Validation.Controller.emptyString(email)) {
                    message = "Email cannot be empty";
                    valid = false;
                }

                if (valid && !App.Validation.Controller.validEmail(email)) {
                    message = "Email is not a valid email address";
                    valid = false;
                }

                if (!valid) {
                    errorEl.text(message).slideDown();
                } else {
                    errorEl.text("").slideUp();
                }

                return valid;
            },

            validatePassword: function(options) {
                var el = options.el;
                var errorEl = options.errorEl;
                var password = el.val().trim();
                var valid = true;
                var message;

                if (App.Validation.Controller.emptyString(password)) {
                    message = "Password cannot be empty";
                    valid = false;
                }

                if (!valid) {
                    errorEl.text(message).slideDown();
                } else {
                    errorEl.text("").slideUp();
                }

                return valid;

            }

        });

    });

});