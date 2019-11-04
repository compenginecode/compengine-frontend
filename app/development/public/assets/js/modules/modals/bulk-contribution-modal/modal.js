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
    var BulkUploadRequest = require("modules/common/models/bulk-upload-request");

    /** Template **/
    var Template = require("text!./modal.html");

    /** Define module **/
    App.module("Modals.BulkContribution", function(Module, Application, Backbone) {

        /**
         *  Module view, Inherits ManagedView
         *
         * @protected
         * @see ManagedView
         */
        Module.Body = App.Common.Views.ManagedView.View.extend({

            events: {
                "submit #request": "onFormSubmit"
            },

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel {Object} An object with data for the template to render
             * @returns {Function} Rendered template
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            initialize: function(options) {
                App.Common.Views.ManagedView.View.prototype.initialize.call(this, options);
                this.model = new App.Common.Models.BulkUploadRequest();
            },

            /**
             *  Setup the event listeners for the modal radio channel
             *
             * @private
             */
            __setupModalRadioEvents: function() {
                this.modalChannel = Backbone.Radio.channel("modals");

                /**
                 * Add response to modal's request.
                 */
                this.modalChannel.reply("shouldModalBePrevented", function() {
                    return true;
                });
            },

            /**
             * When the bulk upload request form is submitted.
             *
             * @method onFormSubmit
             * @param e {Event} The submit event
             */
            onFormSubmit: function(e) {
                e.preventDefault();
                var that = this;

                if (this.validate()) {
                    var button = this.$el.find("#submit");
                    button.addClass("btn-loader");
                    var deferred = this.save();

                    deferred.done(function(res) {
                        var success = that.$el.find("[data-success='form']");
                        success.text("Succesfully sent request").slideDown();

                        window.setTimeout(function() {
                            success.slideUp(function() {
                                var modal = that.options.modal.$el.find(".modal");
                                modal.css("transform", "translateY(-100%)");
                                modal.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function() {
                                    that.options.modal.triggerCancel();
                                });
                            });
                        }, 1500);
                    });

                    deferred.always(function() {
                        button.removeClass("btn-loader");
                    });

                    deferred.fail(function(res) {
                        //
                    });
                }
            },

            /**
             * Abstracted validation method
             *
             * @method __validate
             * @param name {String} The name lookup
             * @return {Boolean} Whether or not it passed validation
             */
            __validate: function(name) {
                var el = this.$el.find("[name='" + name + "']");
                var val = el.val().trim();
                var errorEl = this.$el.find("[data-error='" + name + "']");
                var isValid = true;

                if ("" === val) {
                    errorEl.text("This field must be filled out").show();
                    isValid = false;
                }

                if (isValid) {
                    this.model.set(name, val);
                    errorEl.hide();
                }

                return isValid;
            },

            /**
             * Validate the fields of the form
             *
             * @method validate
             * @return {Boolean} Whether or not the form passed validation
             */
            validate: function() {
                var name = this.__validate("name");
                var emailAddress = this.__validate("emailAddress");
                var organisation = this.__validate("organisation");
                var description = this.__validate("description");


                return name && emailAddress && organisation && description;
            },

            /**
             * Save the model
             *
             * @method save
             * @return {jqXHR} The jqXHR object
             */
            save: function() {
                return this.model.save()
            }

        });

        Module.Modal = App.Modals.BaseModal.Modal.extend({

            /**
             *  The body view for the modal
             *
             * @protected
             */
            bodyView: Module.Body,

            title: "Bulk upload request",

            width: "500px",

            bypassDepthRestrictions: true

        });

    });

});
