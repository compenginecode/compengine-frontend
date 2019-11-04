/**
 *  Upload Filesize Exceeded Modal
 *
 * @module modals/dropzone-error-modal
 * @memberof Modals
 * @see Modals
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Modal dependencies **/
    /** Modal dependencies **/
    var BaseModal = require("modules/modals/base-modal/base-modal");
    var ManagedView = require("modules/common/views/managed-view/managed-view");
    var Message = require("./models/message");

    /** Template **/
    var Template = require("text!./modal.html");

    /** Define module **/
    App.module("Modals.ContactContributor", function(Module, Application, Backbone) {

        /**
         *  Module view, Inherits ManagedView
         *
         * @protected
         * @see ManagedView
         */
        Module.Body = App.Common.Views.ManagedView.View.extend({

            STR_SOMETHING_WENT_WRONG: "Oh no, something's gone wrong. Please try again.",

            className: "contact-contributor--body",

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel {Object} An object with data for the template to render
             * @returns {string} String version of the rendered template
             */
            template: function(serializedModel){
                return _.template(Template)(serializedModel);
            },

            templateHelpers: function () {
                var that = this;
                return {
                    "timeseriesName": that.modal.model.get("name")
                }
            },

            validateName: function() {
                if(this.ui.name.val().length === 0){
                    this.ui.nameError.text("Name is a required field").show();
                    return false;
                }
                this.ui.nameError.hide();
                return true;
            },

            validateMessage: function() {
                if(this.ui.name.val().length === 0){
                    this.ui.messageError.text("Message is a required field").show();
                    return false;
                }
                this.ui.messageError.hide();
                return true;
            },

            validateEmailAddress: function() {
                if(this.ui.emailAddress.val().length === 0){
                    this.ui.emailAddressError.text("Email is a required field").show();
                    return false;
                }
                this.ui.emailAddressError.hide();
                return true;
            },

            validate: function () {
                this.ui.fatalError.hide();
                var nameIsValid = this.validateName();
                var emailAddressIsValid = this.validateEmailAddress();
                var messageIsValid = this.validateMessage();
                return nameIsValid && emailAddressIsValid && messageIsValid;
            },

            ui: {
                name: "#name",
                nameError: "[data-error='name-error']",
                emailAddress: "#email-address",
                emailAddressError: "[data-error='email-address-error']",
                message: "#message",
                messageError: "[data-error='message-error']",
                fatalError: "[fatal-error]"
            },

            serialize: function () {
                return {
                    name: this.ui.name.val(),
                    emailAddress: this.ui.emailAddress.val(),
                    message: this.ui.message.val()
                }
            },

            showGlobalError: function(){
                this.ui.fatalError.text(this.STR_SOMETHING_WENT_WRONG).show();
            }

        });

        Module.Modal = App.Modals.BaseModal.Modal.extend({

            /**
             *  The body view for the modal
             *
             * @protected
             */
            bodyView: Module.Body,

            title: "Contact the contributor",

            keyControl: false,

            /**
             *  Constructor. We override the default constructor and add code to help
             *  handle the specific parameters passed. We also register events into the
             *  modal.
             *
             * @param options
             */
            initialize: function(options){
                App.Modals.BaseModal.Modal.prototype.initialize.call(this, options);

                this.events = this.events || {};
                this.events["click [data-action='send']"] = "__onSendButtonClick";
            },

            /**
             *  Called when the "send" button is clicked. We first check if the view is valid,
             *  and if it is, serialize the view and send it off to the server.
             *
             * @private
             */
            __onSendButtonClick: function() {
                var that = this;
                var $button = this.$el.find("[data-action='send']");
                var modalChannel = Backbone.Radio.channel("modals");
                $button.addClass("btn-loader").blur();

                this.view.$el.find("[fatal-error]").hide();

                if (this.view.validate()){
                    var message = new Module.Models.Message(this.view.serialize());
                    message.set("contributorId", this.model.get("contributorId"));

                    var deferred = message.save();

                    deferred.fail(function(xhrResponse){
                        if (xhrResponse.responseJSON && xhrResponse.responseJSON.class) {
                            that.view.handleServerFail(xhrResponse.responseJSON.class);
                        } else if (xhrResponse.responseJSON && xhrResponse.responseJSON.message) {
                            that.view.ui.fatalError.text(xhrResponse.responseJSON.message).show();
                        } else {
                            that.view.showGlobalError();
                        }
                    });

                    deferred.done(function(responseObj){
                        modalChannel.trigger("modalCompletedSuccess", responseObj);

                        that.triggerCancel();
                    });

                    deferred.error(function(response) {
                        $button.removeClass("btn-loader");
                    });

                } else {
                    $button.removeClass("btn-loader");
                }
            }

        });

    });

});