/**
 *  Contributor controller
 *
 * @module modals/contribution-metadata-modal/controllers/contributor-controller
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");

    /** Local dependencies **/
    var AbstractController = require("./abstract-controller");
    var jQueryUI = require("jquery-ui");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("Modals.ContributionMetadata.Controllers", function(Module, Application, Backbone) {

        /** Define module controller **/
        Module.ContributorController = Module.AbstractController.extend({

            /** String literals **/
            STR_NAME_FIELD_MISSING: "Please enter your name",
            STR_EMAIL_ADDRESS_FIELD_MISSING: "Please enter your email address",
            STR_PRIVACY_POLICY_NOT_AGREED_TO: "You must agree to the privacy policy to contribute the data",

            /** Regex used to validate email addresses **/
            EMAIL_REGEX: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

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
                this.validationRequired = false;
            },

            bindToView: function(){
                this.view.registerEventHandler("change #" + this.view.getContactPermissionCheckboxField().attr("id"),
                    this.__onContactPermissionChange, this);
            },

            /**
             *  Returns true if the DOM has valid user-entered data, and false
             *  otherwise. Also controls UI rendering of states.
             *
             * @returns {boolean}
             */
            validate: function(){
                var nameState = this.__validateName();
                var emailAddressState = this.__validateEmailAddress();
                var privacyPolicyState = this.__validatePrivacyPolicyIsAgreedTo();

                return nameState && emailAddressState && privacyPolicyState;
            },

            /**
             *  Returns an object containing the values managed by this controller.
             *
             * @returns object
             */
            serialize: function(){
                return {
                    contributorName: this.view.getContributorInformationName().val(),
                    contributorEmailAddress: this.view.getContributorInformationEmailAddress().val(),
                    contactPermissionGiven: this.validationRequired,
                    aggregationPermissionGiven: this.view.getAggregationPermissionCheckbox().is(":checked")
                };
            },

            /**
             *  Validates the contributor's name. Returns true if valid, and false otherwise.
             *
             * @returns {boolean}
             * @private
             */
            __validateName: function(){
                /** Always reset in case their intentions have changed **/
                var $nameField = this.view.getContributorInformationName();
                $nameField.siblings(".error-label-small").hide();

                /** We only validate the fields if the user has decided that they want to be notified **/
                if (true !== this.validationRequired){
                    return true;
                }

                if ("" === $nameField.val()){
                    $nameField.siblings(".error-label-small").text(this.STR_NAME_FIELD_MISSING).show();

                    return false;
                }

                return true;
            },

            /**
             *  Validates the contributor's email address. Returns true if valid, and false otherwise.
             *
             * @returns {boolean}
             * @private
             */
            __validateEmailAddress: function(){
                /** Always reset in case their intentions have changed **/
                var $emailAddressField = this.view.getContributorInformationEmailAddress();
                $emailAddressField.siblings(".error-label-small").hide();

                /** We only validate the fields if the user has decided that they want to be notified **/
                if (true !== this.validationRequired){
                    return true;
                }

                if ("" === $emailAddressField.val() || !this.EMAIL_REGEX.test($emailAddressField.val())){
                    $emailAddressField.siblings(".error-label-small").text(this.STR_EMAIL_ADDRESS_FIELD_MISSING).show();

                    return false;
                }

                return true;
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
            },

            /**
             *  Toggle visibility of children fields depending on whether the user has granted contact
             *  permission or not.
             *
             * @param e {Event} An object containing data that will be passed to the event handler (This function).
             * @private
             */
            __onContactPermissionChange: function(e) {
                $(e.target).attr("aria-checked", e.target.checked);
                this.view.getAggregationPermissionCheckbox().closest(".form-group").toggle(e.target.checked);
                this.view.getContributorInformationSection().toggle(e.target.checked);

                this.validationRequired = e.target.checked;
            }

        });

    });

});