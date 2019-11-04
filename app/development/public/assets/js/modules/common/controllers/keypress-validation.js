/**
 *  Configuration storage module
 *
 * @module common/controllers/configuration-store
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Define module **/
    App.module("KeypressValidation", function(Module, Application, Backbone){

        /** Define controller **/
        Module.Definition = Marionette.Object.extend({

            /**
             *  The list of globally allowed edit keys (EG/ Backspace)
             *
             * @protected
             */
            allowedGlobalKeyCodes: {
                ArrowDown: true,
                ArrowUp: true,
                ArrowLeft: true,
                ArrowRight: true,
                Enter: true,
                Escape: true,
                Backspace: true,
                Home: true,
                End: true,
                Tab: true,
                Control: true,
                " ": true
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
            },

            /**
             * Check the validity of the keypress
             *
             * @param e {Event} The keypress event
             * @returns {boolean|void} Returns true (Exiting function) if it was a globally allowed key.
             */
            keypressIsAlphaNumeric: function(e) {
                var keyCode = e.key;
                /**
                 * This will allow for backspaces, arrow keys etc.
                 */
                if(this.allowedGlobalKeyCodes[keyCode] !== undefined) {
                    return true;
                } else {
                    if(!this.__checkAlphaNumericValidity(keyCode)) {
                        e.preventDefault();
                    }
                }
            }

        });

        Module.Controller = new Module.Definition();

    });

});