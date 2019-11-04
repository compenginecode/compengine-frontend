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
    App.module("AdminSearchTimeseriesPage.SearchForm.Controllers", function(Module, Application, Backbone) {

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

                /** Simply hide the error messages even if they're not visible right now. **/
                $el.find("input").each(function(index, element) {
                    $(element).siblings(".error-label-small").hide();
                });

                return true;
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