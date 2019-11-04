/**
 *  Category Controller Module
 *
 * @module modals/contribution-metadata-modal/controllers/category-controller
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");

    /** Local dependencies **/
    var AbstractController = require("./abstract-controller");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("Modals.ContributionMetadata.Controllers", function(Module, Application, Backbone) {

        /** Define module controller **/
        Module.StaticDataController = Module.AbstractController.extend({

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

            /** String literals **/
            STR_FIELD_MISSING: "Please enter a name for this time series",
            STR_NAME_IN_USE: "This name is already being used",

            /**
             *  Initialization
             *
             * @param view {ManagedView} A view object for accessing methods inside the parent.
             */
            initialize: function(view){
                this.view = view;
            },

            bindToView: function(){
                this.view.registerEventHandler("keydown #" + this.view.getTimeSeriesNameInputField().attr("id"),
                    this.__onTimeSeriesNameKeyDown, this);
            },

            /**
             *  Returns an object containing the values managed by this controller.
             *
             * @returns object
             */
            serialize: function(){
                return {
                    name: this.view.getTimeSeriesNameInputField().val(),
                    description: this.view.getDescriptionInputField().val()
                };
            },

            /**
             *  Used to handle errors that come from the server. The controller
             *  can decide if and how it wants to handle it locally. In this case,
             *  we want to handle errors of classification "ETimeSeriesNameInUse".
             *
             *  @return null
             *
             */
            handleServerFail: function(classification){
                if ("ETimeSeriesNameInUse" === classification){
                    this.view.getTimeSeriesNameInputField().siblings(".error-label-small")
                        .text(this.STR_NAME_IN_USE)
                        .show();
                }
            },

            /**
             *  Returns true if the DOM has valid user-entered data, and false
             *  otherwise. Also controls UI rendering of states.
             *
             * @returns {boolean}
             */
            validate: function(){
                var $field = this.view.getTimeSeriesNameInputField();
                $field.siblings(".error-label-small").hide();

                if ("" === $field.val().trim()){
                    $field.siblings(".error-label-small").text(this.STR_FIELD_MISSING).show();

                    return false;
                }

                return true;
            },

            /**
             *  On a keydown event, we will verify if the key is alphabetical or not & then prevent the keypress
             *  if it is not alphabetical.
             *
             * @param e
             * @returns {boolean}
             * @private
             */
            __onTimeSeriesNameKeyDown: function(e) {
                var keyCode = e.key;

                /**
                 * This will allow for backspaces, arrow keys etc.
                 */
                if(this.allowedGlobalKeyCodes[keyCode] !== undefined) {
                    return true;
                } else {
                    if(!this.__checkAlphabeticalValidity(keyCode)) {
                        e.preventDefault();
                    }
                }
            },

            /**
             *  Given a string, It will check whether that string is an alphabetical string or contains
             *  special characters.
             *
             * @param string {string} The string of the key that was pressed.
             * @returns {boolean} Will return true/false depending on if the input was a letter.
             * @private
             */
            __checkAlphabeticalValidity: function(string) {
                return /^[a-z]+$/i.test(string);
            }

        });

    });

});