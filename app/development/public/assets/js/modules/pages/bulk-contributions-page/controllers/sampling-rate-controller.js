/**
 *  Sampling Rate Controller Module
 *
 * @module bulk-contributions/controllers
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");

    /** Local dependencies **/
    var SamplingRateController = require("modules/modals/contribution-metadata-modal/controllers/sampling-rate-controller");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("BulkContributions.Controllers", function(Module) {

        /** Define module controller **/
        Module.SamplingRateController = App.Modals.ContributionMetadata.Controllers.SamplingRateController.extend({
            STR_NO_RATE_ENTERED: "Please enter a sampling rate",
            STR_NO_UNIT_ENTERED: "Please enter a sampling unit",
            bindToView: function(){
                var that = this;

                /**
                 * We want to bind a behaviour to a specific input.
                 */
                this.view.on("render", function() {
                    that.__limitSamplingRateInputType();
                });
            },
            validate: function () {
                var rateIsValid = this.__validateRate();
                var unitIsValid = this.__validateUnit();
                return rateIsValid && unitIsValid;
            },
            __validateRate: function () {
                var $field = this.view.getSamplingRateInputPresent().find("#sampling-rate");
                $field.siblings(".error-label-small").hide();

                if ("" === $field.val().trim()){
                    $field.siblings(".error-label-small").text(this.STR_NO_RATE_ENTERED).show();

                    return false;
                }

                return true;
            },
            __validateUnit: function () {
                var $field = this.view.getSamplingRateInputPresent().find("#sampling-unit");
                $field.siblings(".error-label-small").hide();

                if ("" === $field.val().trim()){
                    $field.siblings(".error-label-small").text(this.STR_NO_UNIT_ENTERED).show();

                    return false;
                }

                return true;
            }
        });

    });

});