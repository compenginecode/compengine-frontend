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

    /** Template **/
    var Template = require("text!./modal.html");

    /** Define module **/
    App.module("Modals.UploadErrorCommon", function(Module, Application, Backbone) {

        /**
         *  Module view, Inherits ManagedView
         *
         * @protected
         * @see ManagedView
         */
        Module.Body = App.Common.Views.ManagedView.View.extend({

            /**
             * Content to render for the error modal
             */
            content: "",

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel {Object} An object with data for the template to render
             * @returns {Function} Rendered template
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            /**
             * Template helper
             *
             * @returns {Object}
             * @see http://marionettejs.com/docs/v2.4.7/marionette.view.html#viewtemplatehelpers
             */
            templateHelpers: function() {
                return {
                    content: this.content
                };
            },

            /**
             *  When the dom has been rendered, we want to manipulate the DOM with some plugins.
             *
             * @private
             */
            onRender: function() {
                App.Common.Views.ManagedView.View.prototype.onRender.call(this);
            },

            /**
             * Initialize the module
             * 
             * @param options
             */
            initialize: function(options) {
                this.content = options.content;
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
            }
        });

        Module.Modal = App.Modals.BaseModal.Modal.extend({

            /**
             *  The body view for the modal
             *
             * @protected
             */
            bodyView: Module.Body,

            /**
             *  Constructor. We override the default constructor and add code to help
             *  handle the specific parameters passed.
             *
             * @param options {Object} Paramaters to pass to the modal
             */
            initialize: function(options){
                App.Modals.BaseModal.Modal.prototype.initialize.call(this, options);

                options = options || {};
            }

        });

    });

});