/**
 *  Privacy controller
 *
 * @module bulk-contributions/controllers
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");

    /** Local dependencies **/
    var ContributorController = require("modules/modals/contribution-metadata-modal/controllers/contributor-controller");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("BulkContributions.Controllers", function(Module) {

        /** Define module controller **/
        Module.PrivacyController = App.Modals.ContributionMetadata.Controllers.ContributorController.extend({

            /** String literals **/
            STR_PRIVACY_POLICY_NOT_AGREED_TO: "You must agree to the privacy policy to contribute the data",

            /**
             *  Array or current tags
             *
             * @private
             */
            currentTags: [],

            /**
             *  Initialization
             *
             * @param view {ManagedView} A view object for accessing methods inside the parent.
             */
            initialize: function(view){
                this.view = view;
            },

            bindToView: function(){

            },

            /**
             *  Returns true if the DOM has valid user-entered data, and false
             *  otherwise. Also controls UI rendering of states.
             *
             * @returns {boolean}
             */
            validate: function(){
                return this.__validatePrivacyPolicyIsAgreedTo();
            },

            /**
             *  Returns an object containing the values managed by this controller.
             *
             * @returns object
             */
            serialize: function(){
                return {
                    contactPermissionGiven: this.validationRequired
                };
            },

            /**
             *  Validates that the privacy policy has been read and understood. Returns true if
             *  if has, and false otherwise.
             *
             * @returns {boolean}
             * @private
             */
            __validatePrivacyPolicyIsAgreedTo: function(){
                /** Always reset in case their intentions have changed **/
                var $privacyField = this.view.getPrivacyPolicyAgreedCheckboxField();
                /** Remove d-inline-block class as it has an !important attribute. **/
                $privacyField.siblings(".error-label-small").removeClass("d-inline-block");

                if (!$privacyField.is(":checked")){
                    /** We want the <span> element to display on a new line, so it has to be display: inline-block; **/
                    $privacyField.siblings(".error-label-small").text(this.STR_PRIVACY_POLICY_NOT_AGREED_TO).addClass("d-inline-block");

                    return false;
                }

                return true;
            }

        });

    });

});