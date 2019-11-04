define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var Model = require("../models/oauth");

    /** Module definition **/
    App.module("AdminLoginPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.Authentication = Marionette.Object.extend({

            /**
             * Abstracted login functionality
             *
             * @param loginObject {Object} The login object that contains email & password
             * @param callback {Function} Callback function that will simply return success or error.
             * @returns {void}
             */
            login: function(loginObject, callback) {
                var model = new Module.Model();
                model.set("emailAddress", loginObject.email);
                model.set("password", loginObject.password);

                var deferred = model.save();

                deferred.done(function(result) {
                    callback("success", result)
                });

                deferred.fail(function(error) {
                    var invalidCredentials = 422 === error.status || 400 === error.status;

                    if (invalidCredentials) {
                        callback("error", {
                            status: error.status,
                            error: "It appears that the combination of email & password provided are incorrect.",
                            errorObject: error
                        });
                    }

                    if (!invalidCredentials) {
                        callback("error", {
                            status: error.status,
                            error: "Oh no, it appears that something went wrong, Try again perhaps?",
                            errorObject: error
                        });
                    }
                });
            }

        });

    });

});