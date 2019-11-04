define(function(require) {

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Module definition **/
    App.module("Validation", function (Module, Application, Backbone) {

        /** Define route controller **/
        Module.Definition = Marionette.Object.extend({

            /**
             * Determine if the email is a valid email or not.
             *
             * @param email {string} The email you're validating
             * @returns {boolean} True if the email is valid.
             */
            validEmail: function (email) {
                return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
            },

            /**
             * Check whether or not a given string is empty or not
             *
             * @param string {string} The string to check
             *
             * @returns {boolean} True if the string is empty
             */
            emptyString: function (string) {
                return string === "";
            }

        });

        Module.Controller = new Module.Definition();

    });

});