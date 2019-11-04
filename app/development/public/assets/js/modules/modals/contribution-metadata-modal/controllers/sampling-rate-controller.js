/**
 *  Sampling rate controller
 *
 * @module modals/contribution-metadata-modal/controllers/sampling-rate-controller
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");

    /** Local dependencies **/
    var AbstractController = require("./abstract-controller");
    var AutoNumeric = require("autoNumeric");
    var jQueryUI = require("jquery-ui");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("Modals.ContributionMetadata.Controllers", function(Module, Application, Backbone) {

        /** Define module controller **/
        Module.SamplingRateController = Module.AbstractController.extend({

            /**
             *  Returns true/false depending on if they have checked
             *  the "Is there a sampling rate?" checkbox
             *
             * @private
             * @returns {boolean} Default state is false, it will be inverted each time you click the checkbox
             */
            hasSamplingRate: false,

            /**
             *  Initialization
             *
             * @param view {ManagedView} A view object for accessing methods inside the parent.
             */
            initialize: function(view){
                this.view = view;
            },

            bindToView: function(){
                var that = this;

                this.view.registerEventHandler("change #" + this.view.getSamplingRateCheckbox().attr("id"),
                    this.__onSamplingRatePresentChange, this);

                /**
                 * We want to bind a behaviour to a specific input.
                 */
                this.view.on("render", function() {
                    that.__limitSamplingRateInputType();
                });
            },

            /**
             *  Returns an object containing the values managed by this controller.
             *
             * @returns object
             */
            serialize: function(){
                return {
                    samplingRate: this.view.getSamplingRateInputPresent().find("#sampling-rate").val(),
                    samplingUnit: this.view.getSamplingRateInputPresent().find("#sampling-unit").val()
                };
            },

            /**
             *  Returns true if the DOM has valid user-entered data, and false
             *  otherwise. Also controls UI rendering of states.
             *
             * @returns {boolean} Returns true or false depending on if the form state is valid or not.
             */
            validate: function(){
                var $el = this.view.getSamplingRateInputPresent();
                var isValid = true;

                /**
                 * If sampling rate is enabled, sampling rate & unit are required.
                 */
                if(this.hasSamplingRate) {
                    /**
                     * Instead of hard coding the input elements we currently know about, We'll run a loop on
                     * each input we find in the container, therefore allowing Identifiers to change without breaking
                     * validation.
                     */
                    $el.find("input").each(function(index, element) {
                        /** If the input is empty **/
                        if("" === $(element).val().trim()) {
                            /** Find the error message element & Show it **/
                            $(element).siblings(".error-label-small").show();

                            /** Only change invalid state once there is an invalid state. **/
                            isValid = false;
                        } else {
                            /**
                             * If it has a valid state, hide the error message.
                             */
                            $(element).siblings(".error-label-small").hide();
                        }
                    });
                } else {
                    /** Simply hide the error messages even if they're not visible right now. **/
                    $el.find("input").each(function(index, element) {
                        $(element).siblings(".error-label-small").hide();
                    });

                    /**
                     * If there is no way the state could be invalid, we will force a valid state just to
                     * be on the safe side.
                     *
                     * @type {boolean}
                     */
                    isValid = true;
                }

                return isValid;
            },

            /**
             *  When the checkbox for "Notify me when data is uploaded that is similar to mine" changes its value,
             *  we want to hook into it and run our own set of functions.
             *
             * @param e {Event} An object containing data that will be passed to the event handler (This function).
             * @private
             */
            __onSamplingRatePresentChange: function(e) {
                $(e.target).attr("aria-checked", e.target.checked);
                this.view.getSamplingRateInputPresent().toggle(e.target.checked);

                /** Toggle the state of the hasSamplingRate variable **/
                this.hasSamplingRate = !this.hasSamplingRate;
            },

            /**
             *  Bind autonumeric to the input and limit what can be put into the field.
             *
             * @private
             */
            __limitSamplingRateInputType: function() {
                var $el = this.view.getSamplingRateInputPresent().find("#sampling-rate");

                $el.autoNumeric({
                    mDec: 2
                });
            }

        });

    });

});